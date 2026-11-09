import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerificationQueue from "./verification-queue";
import "../../auth.css";
export const dynamic = "force-dynamic";
export default async function VerificationAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.app_metadata?.role !== "admin") redirect("/dashboard");
  const { data, error } = await supabase.from("identity_verifications").select("id,user_id,document_type,document_country,status,submitted_at,review_note,id_document_path,selfie_path").order("submitted_at", { ascending: false });
  if (error) throw new Error("Unable to load the identity review queue.");
  const cases = await Promise.all((data ?? []).map(async item => {
    const [idDoc, selfie] = await Promise.all([
      supabase.storage.from("identity-verification").createSignedUrl(item.id_document_path, 300),
      supabase.storage.from("identity-verification").createSignedUrl(item.selfie_path, 300),
    ]);
    if (idDoc.error || selfie.error) throw new Error("Unable to securely open a verification document.");
    return { ...item, idUrl: idDoc.data.signedUrl, selfieUrl: selfie.data.signedUrl };
  }));
  return <main className="member-shell"><header className="member-header"><a className="brand" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a><a className="text-link" href="/dashboard">Member dashboard</a></header><VerificationQueue initialCases={cases} /></main>;
}
