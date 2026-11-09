import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardActions from "./actions";
import ProfileEditor from "./profile-editor";
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
      <article className="member-card">
        <span className="member-step">01 / YOUR PROFILE</span>
        <h2>Build your introduction</h2>
        <p>Keep your personal details accurate. Profile editing and photographs will be added in the next step.</p>
        <dl>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Country</dt><dd>{profile?.country || "Not set"}</dd></div>
          <div><dt>Relationship goal</dt><dd>{profile?.relationship_goal === "marriage" ? "Marriage" : "Serious relationship"}</dd></div>
        </dl>
      </article>
      <article className="member-card">
        <span className="member-step">02 / TRUST & SAFETY</span>
        <h2>Identity verification</h2>
        <p>Identity checks are not yet open. We will introduce a secure provider and consent process before collecting any identity documents or videos.</p>
        <span className="status-pill">Verification setup pending</span>
      </article>
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
