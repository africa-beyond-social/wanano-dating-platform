"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Case = { id: string; user_id: string; document_type: string; document_country: string; status: "pending" | "approved" | "rejected"; submitted_at: string; review_note: string | null; idUrl: string; selfieUrl: string };
export default function VerificationQueue({ initialCases }: { initialCases: Case[] }) {
  const [cases, setCases] = useState(initialCases);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  async function review(item: Case, status: "approved" | "rejected") {
    setWorking(item.id); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage("Your administrator session has expired. Sign in again."); setWorking(""); return; }
    const note = (notes[item.id] ?? "").trim();
    if (status === "rejected" && !note) { setMessage("Add a short reason before rejecting a submission."); setWorking(""); return; }
    const { error } = await supabase.from("identity_verifications").update({ status, review_note: note || null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", item.id);
    if (error) setMessage(error.message);
    else { setCases(rows => rows.map(row => row.id === item.id ? { ...row, status, review_note: note || null } : row)); setMessage("Review decision saved."); }
    setWorking("");
  }
  return <section className="verification-queue">
    <div className="verification-queue-heading"><span className="member-step">WANANO / TRUST & SAFETY</span><h1>Identity review queue</h1><p>Access is restricted to accounts with role=admin in Supabase app_metadata.</p></div>
    {message && <p className="form-alert" role="status">{message}</p>}
    {cases.length === 0 ? <article className="member-card"><h2>No submissions yet</h2><p>New manual verification requests will appear here.</p></article> : cases.map(item => <article className="member-card verification-case" key={item.id}>
      <div className="verification-case-top"><div><span className="member-step">{item.document_type === "passport" ? "PASSPORT" : "NATIONAL ID"} · {item.document_country}</span><h2>Member: {item.user_id}</h2><p>Submitted {new Date(item.submitted_at).toLocaleString()}</p></div><span className="status-pill">{item.status}</span></div>
      <div className="verification-documents"><a href={item.idUrl} target="_blank" rel="noreferrer">Open identity document ↗</a><a href={item.selfieUrl} target="_blank" rel="noreferrer">Open selfie ↗</a></div>
      <label>Review note<textarea rows={3} value={notes[item.id] ?? item.review_note ?? ""} onChange={e => setNotes(values => ({ ...values, [item.id]: e.target.value }))} maxLength={500} placeholder="Add a reason for rejection or a concise internal note." /></label>
      {item.status === "pending" && <div className="verification-review-actions"><button className="button" type="button" disabled={!!working} onClick={() => void review(item, "approved")}>{working === item.id ? "Saving…" : "Approve identity"}</button><button className="button button-danger" type="button" disabled={!!working} onClick={() => void review(item, "rejected")}>Reject submission</button></div>}
    </article>)}
  </section>;
}
