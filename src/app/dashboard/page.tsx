import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardActions from "./actions";
import ProfileEditor from "./profile-editor";
import ProfilePhotos from "./profile-photos";
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

  const essentials = [
    profile?.full_name,
    profile?.gender,
    profile?.country,
    profile?.relationship_goal,
  ];
  const completedEssentials = essentials.filter(Boolean).length;
  const completion = Math.round((completedEssentials / essentials.length) * 100);

  return <main className="member-shell">
    <header className="member-header">
      <a className="brand" href="/" aria-label="WANANO home"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a>
      <nav className="member-nav" aria-label="Dashboard sections">
        <a href="#profile">My profile</a>
        <a href="#photos">Photographs</a>
        <a href="#trust">Trust &amp; safety</a>
        <a href="#matchmaking">Matchmaking</a>
      </nav>
      <DashboardActions />
    </header>

    <section className="member-hero">
      <div className="member-welcome">
        <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PRIVATE WANANO SPACE</div>
        <h1>Welcome, {profile?.full_name || "WANANO member"}.</h1>
        <p>A more thoughtful journey begins with an introduction that reflects who you are and what you value.</p>
        <div className="member-hero-note"><span className="member-note-icon">✦</span> Meaningful connections. Lasting love.</div>
      </div>
      <aside className="member-progress-card" aria-label="Profile completion">
        <div className="progress-card-top"><span>Profile essentials</span><strong>{completion}%</strong></div>
        <div className="progress-track" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: completion + "%" }} />
        </div>
        <p>{completedEssentials} of 4 essential details completed</p>
        <a href="#profile">Continue your introduction <span>↗</span></a>
      </aside>
      <span className="member-hero-orb member-hero-orb-one" aria-hidden="true" />
      <span className="member-hero-orb member-hero-orb-two" aria-hidden="true" />
    </section>

    <div className="member-content">
      <div className="member-section-heading">
        <div><span className="member-step">YOUR WANANO JOURNEY</span><h2>Start with the essentials.</h2></div>
        <span className="member-private-label"><span /> Private member area</span>
      </div>
      <section className="member-grid">
        <div id="profile"><ProfileEditor userId={user.id} profile={{
          full_name: profile?.full_name || "",
          gender: profile?.gender || "",
          country: profile?.country || "",
          city: profile?.city || null,
          relationship_goal: profile?.relationship_goal || "serious_relationship",
          bio: profile?.bio || null
        }} /></div>
        <div id="photos"><ProfilePhotos userId={user.id} /></div>
        <article className="member-card member-status-card" id="trust">
          <span className="member-step">02 / TRUST &amp; SAFETY</span>
          <div className="status-card-icon status-shield" aria-hidden="true">✓</div>
          <h2>Identity verification</h2>
          <p>We are preparing a secure verification provider and consent process. Identity documents and videos will only be requested when the safeguards are ready.</p>
          <span className="status-pill"><span className="status-dot" /> Verification setup pending</span>
        </article>
        <article className="member-card member-status-card member-card-wide" id="matchmaking">
          <span className="member-step">03 / MATCHMAKING</span>
          <div className="status-card-icon status-heart" aria-hidden="true">♡</div>
          <h2>Meaningful introductions take preparation</h2>
          <p>Matchmaking is not active yet. It will open after the profile and identity-check stages are ready and reviewed.</p>
          <span className="status-pill"><span className="status-dot" /> Matchmaking not yet active</span>
        </article>
      </section>
      <p className="member-footnote">Your account is private. Never send identity documents or verification videos by email or chat.</p>
    </div>
    <footer className="member-footer"><a className="brand brand-footer" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a><span>Meaningful connections. Lasting love.</span><a href="/privacy">Privacy &amp; safety</a></footer>
  </main>;
}
