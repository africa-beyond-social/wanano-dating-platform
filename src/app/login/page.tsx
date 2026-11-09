import "../auth.css";

export default function LoginPage() {
  return <main className="auth-shell">
    <a className="brand" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a>
    <section className="auth-card">
      <div className="eyebrow">Welcome back</div>
      <h1>Log in to WANANO</h1>
      <p>Your next meaningful connection begins with intention.</p>
      <form>
        <label>Email address<input autoComplete="email" type="email" name="email" placeholder="you@example.com" required /></label>
        <label>Password<input autoComplete="current-password" type="password" name="password" placeholder="Your password" required /></label>
        <button className="button form-button" type="button" disabled>Log in — coming soon</button>
      </form>
      <div className="auth-note">New to WANANO? <a href="/register">Create an account</a></div>
      <p className="notice">Login will become available when secure authentication is integrated.</p>
    </section>
    <a className="back-home" href="/">← Back to WANANO</a>
  </main>;
}
