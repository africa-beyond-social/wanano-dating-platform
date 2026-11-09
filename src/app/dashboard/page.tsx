import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardActions from "./actions";
import ProfileEditor from "./profile-editor";
import ProfilePhotos from "./profile-photos";
import IdentityVerification from "./identity-verification";
import "../auth.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,date_of_birth,gender,country,city,relationship_goal,bio")
    .eq("id", user.id)
    .maybeSingle();

  const { data: verification } = await supabase.from("identity_verifications").select("id,document_type,document_country,status,submitted_at,review_note").eq("user_id", user.id).order("submitted_at", { ascending: false }).limit(1).maybeSingle();
  const verificationEnabled = process.env.NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED === "true";

  return <main className="member-shell">
    <header className="member-header">
      <a className="brand" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a>
      <DashboardActions />
    </header>
    <section className="member-welcome">
      <div className="eyebrow">Your private space</div>
      <h1>Welcome, {profile?.full_name || "WANANO member"}.</h1>
      <p>Your journey starts with a complete profile and verified identity. We will guide you through each step.</p>
    </section>
    <section className="member-grid">
      <ProfileEditor userId={user.id} profile={{
        full_name: profile?.full_name || "",
        gender: profile?.gender || "",
        country: profile?.country || "",
        city: profile?.city || null,
        relationship_goal: profile?.relationship_goal || "serious_relationship",
        bio: profile?.bio || null
      }} />
      <ProfilePhotos userId={user.id} />
      <IdentityVerification userId={user.id} enabled={verificationEnabled} verification={verification} />
      <article className="member-card member-card-wide">
        <span className="member-step">03 / MATCHMAKING</span>
        <h2>Meaningful introductions take preparation</h2>
        <p>Matchmaking is not active yet. It will open only after your profile and identity checks have been completed and reviewed.</p>
        <span className="status-pill">Matchmaking not yet active</span>
      </article>
    </section>
    <p className="member-footnote">Your account is private. Never send identity documents or verification videos by email or chat.</p>
  </main>;
}
