"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Verification = { id: string; document_type: "national_id" | "passport"; document_country: string; status: "pending" | "approved" | "rejected"; submitted_at: string; review_note: string | null };
const ID_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const SELFIE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function IdentityVerification({ userId, enabled, verification }: { userId: string; enabled: boolean; verification: Verification | null }) {
  const [documentType, setDocumentType] = useState<"national_id" | "passport">("national_id");
  const [country, setCountry] = useState("Zimbabwe");
  const [document, setDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [current, setCurrent] = useState(verification);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(""); setNotice("");
    if (!document || !selfie) return setError("Upload both your identity document and a clear selfie.");
    if (!ID_TYPES.includes(document.type) || document.size > 8 * 1024 * 1024) return setError("The ID document must be JPG, PNG, WebP or PDF and no larger than 8 MB.");
    if (!SELFIE_TYPES.includes(selfie.type) || selfie.size > 5 * 1024 * 1024) return setError("The selfie must be JPG, PNG or WebP and no larger than 5 MB.");
    if (country.trim().length < 2 || country.trim().length > 80) return setError("Enter a valid document-issuing country.");
    if (!consent) return setError("Confirm the privacy and verification consent before submitting.");

    setBusy(true);
    const supabase = createClient();
    const caseId = crypto.randomUUID();
    const ext = (file: File) => file.type === "image/jpeg" ? "jpg" : file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const idPath = userId + "/" + caseId + "/identity-document." + ext(document);
    const selfiePath = userId + "/" + caseId + "/selfie." + ext(selfie);
    let uploadedId = false, uploadedSelfie = false;
    try {
      const first = await supabase.storage.from("identity-verification").upload(idPath, document, { contentType: document.type, upsert: false });
      if (first.error) throw first.error;
      uploadedId = true;
      const second = await supabase.storage.from("identity-verification").upload(selfiePath, selfie, { contentType: selfie.type, upsert: false });
      if (second.error) throw second.error;
      uploadedSelfie = true;
      const { data, error: insertError } = await supabase.from("identity_verifications").insert({
        user_id: userId, document_type: documentType, document_country: country.trim(),
        id_document_path: idPath, selfie_path: selfiePath, consent_accepted_at: new Date().toISOString(),
      }).select("id,document_type,document_country,status,submitted_at,review_note").single();
      if (insertError) throw insertError;
      setCurrent(data as Verification);
      setNotice("Your verification request was submitted securely and is awaiting manual review.");
      setDocument(null); setSelfie(null); setConsent(false); form.reset();
    } catch (err) {
      if (uploadedId || uploadedSelfie) await supabase.storage.from("identity-verification").remove([...(uploadedId ? [idPath] : []), ...(uploadedSelfie ? [selfiePath] : [])]);
      setError(err instanceof Error ? err.message : "We could not submit your verification. Please try again.");
    } finally { setBusy(false); }
  }

  return <section className="member-card member-card-wide identity-card">
    <span className="member-step">02 / TRUST & SAFETY</span><h2>Identity verification</h2>
    {!enabled ? <>
      <p>Manual verification is being prepared. Secure document intake is switched off while WANANO completes its privacy, retention and administrator-access checks. Do not email or message identity documents to anyone claiming to represent WANANO.</p>
      <span className="status-pill">Secure intake not yet open</span>
    </> : current && current.status !== "rejected" ? <>
      <p>Your verification request was submitted on {new Date(current.submitted_at).toLocaleDateString()}.</p>
      <span className="status-pill">{current.status === "pending" ? "Awaiting manual review" : current.status === "approved" ? "Identity approved" : "Further action required"}</span>
      {current.status === "rejected" && current.review_note && <p className="form-alert form-error">{current.review_note}</p>}
      <p className="photo-privacy-note">Your documents are stored privately and are not visible to other members.</p>
    </> : <>
      {current?.status === "rejected" && <p className="form-alert form-error">Your previous request was not approved. {current.review_note || "You may submit a corrected request."}</p>}
      <p>Submit a government-issued identity document and a recent selfie. An authorized WANANO administrator will review them manually.</p>
      <form className="profile-form" onSubmit={submit}>
        <label>Document type<select value={documentType} onChange={e => setDocumentType(e.target.value as "national_id" | "passport")}><option value="national_id">National identity document</option><option value="passport">Passport</option></select></label>
        <label>Issuing country<input value={country} onChange={e => setCountry(e.target.value)} maxLength={80} required /></label>
        <label>Identity document (JPG, PNG, WebP or PDF · max 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setDocument(e.target.files?.[0] ?? null)} required /></label>
        <label>Recent selfie (JPG, PNG or WebP · max 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setSelfie(e.target.files?.[0] ?? null)} required /></label>
        <label className="identity-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>I consent to WANANO processing these documents solely for identity verification. I understand access is restricted to authorized verification administrators and retention will follow WANANO's published policy.</span></label>
        {error && <p className="form-alert form-error" role="alert">{error}</p>}
        {notice && <p className="form-alert form-success" role="status">{notice}</p>}
        <button className="button" type="submit" disabled={busy}>{busy ? "Submitting securely…" : "Submit for manual review"} <span>↗</span></button>
      </form>
      <p className="photo-privacy-note">Your files are in private storage. WANANO does not store your full ID number in the profile database.</p>
    </>}
    {error && current && <p className="form-alert form-error" role="alert">{error}</p>}
    {notice && current && <p className="form-alert form-success" role="status">{notice}</p>}
  </section>;
}
