const principles = [
  { n: "01", title: "Verified identity", body: "Government ID and live-video checks form part of the verification journey before matchmaking access." },
  { n: "02", title: "Thoughtful compatibility", body: "Recommendations consider relationship goals, values, communication and the life you hope to build." },
  { n: "03", title: "One connection at a time", body: "When two members mutually accept an introduction, new introductions pause while they explore that connection." }
];
const steps = [
  { n: "01", title: "Create your profile", body: "Tell us what matters to you and the kind of relationship you are seeking." },
  { n: "02", title: "Verify who you are", body: "Complete identity, live-video and eligible social-account checks before entering matchmaking." },
  { n: "03", title: "Meet with intention", body: "Receive compatible introductions and connect when interest is mutual." }
];

export default function Home() {
  return <main>
    <header className="site-header">
      <a className="brand" href="/" aria-label="WANANO home"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a>
      <nav className="desktop-nav"><a href="#how-it-works">How it works</a><a href="#promise">Our promise</a><a href="#safety">Safety first</a></nav>
      <div className="header-actions"><a className="login-link" href="/login">Log in</a><a className="button button-small" href="/register">Join WANANO <span>↗</span></a></div>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> A more intentional way to meet</div>
        <h1>Find a connection<br/>that <em>means something.</em></h1>
        <p className="hero-intro">For people who are ready for more than a passing introduction. WANANO brings verified identities and thoughtful compatibility together to help make room for lasting love.</p>
        <div className="hero-actions"><a className="button" href="/register">Start your journey <span>↗</span></a><a className="text-link" href="#how-it-works">Discover how it works ↓</a></div>
        <div className="hero-note"><span className="shield">✓</span> Built for serious relationships and marriage</div>
      </div>
      <div className="hero-art" aria-label="Abstract illustration representing two people coming together">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-sun"/>
        <div className="person person-one"><div className="person-head"/><div className="person-body"/></div>
        <div className="person person-two"><div className="person-head"/><div className="person-body"/></div>
        <div className="heart-mark">♡</div>
        <div className="floating-tag tag-top"><span>✓</span> Identity matters</div>
        <div className="floating-tag tag-bottom">A more thoughtful match <b>✦</b></div>
        <div className="art-caption"><span>W</span><div><strong>Made for meaningful connections</strong><small>Not endless swiping.</small></div></div>
      </div>
    </section>
    <section className="trust-strip" id="safety">
      <div><span className="trust-icon">◇</span><span><strong>Identity-led</strong><small>Verification-first membership</small></span></div>
      <div><span className="trust-icon">♡</span><span><strong>Compatibility-minded</strong><small>Values beyond appearances</small></span></div>
      <div><span className="trust-icon">↗</span><span><strong>Intentional connections</strong><small>One exclusive match at a time</small></span></div>
    </section>
    <section className="intro-section" id="promise">
      <div className="section-heading"><div className="eyebrow">The WANANO difference</div><h2>Connection deserves<br/><em>care and intention.</em></h2><p>We believe the journey to a lasting relationship should begin with trust, a little more understanding and the freedom to focus on one genuine connection.</p></div>
      <div className="value-list">{principles.map(p=><article className="value-item" key={p.n}><span className="value-number">{p.n}</span><div><h3>{p.title}</h3><p>{p.body}</p></div><span className="value-arrow">↗</span></article>)}</div>
    </section>
    <section className="how-section" id="how-it-works"><div className="how-heading"><div className="eyebrow">A journey with purpose</div><h2>Three steps. A more meaningful start.</h2></div><div className="steps-grid">{steps.map(s=><article className="step-card" key={s.n}><span>{s.n}</span><div className="step-line"/><h3>{s.title}</h3><p>{s.body}</p></article>)}</div></section>
    <section className="closing-cta"><div className="cta-orb"/><div className="eyebrow">Your next chapter starts here</div><h2>Make room for<br/><em>something meaningful.</em></h2><p>Start with intention. Let trust lead the way.</p><a className="button button-light" href="/register">Join WANANO <span>↗</span></a></section>
    <footer className="site-footer"><a className="brand brand-footer" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a><span>© {new Date().getFullYear()} WANANO. Meaningful connections. Lasting love.</span><a href="/login">Member login ↗</a></footer>
  </main>;
}
