import "../auth.css";

export default function RegisterPage() {
  return <main className="auth-shell">
    <a className="brand" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></a>
    <section className="auth-card">
      <div className="eyebrow">Begin with intention</div>
      <h1>Create your account</h1>
      <p>Join a community built around verified identities and meaningful relationships.</p>
      <form>
        <label>Full name<input autoComplete="name" name="name" placeholder="Your full name" required /></label>
        <label>Email address<input autoComplete="email" type="email" name="email" placeholder="you@example.com" required /></label>
        <label>Create password<input autoComplete="new-password" type="password" name="password" placeholder="At least 8 characters" minLength={8} required /></label>
        <label className="check-row"><input type="checkbox" required /> I confirm that I am 18 or older and agree to the Terms and Privacy Policy.</label>
        <button className="button form-button" type="button" disabled>Create account — coming soon</button>
      </form>
      <div className="auth-note">Already registered? <a href="/login">Log in</a></div>
      <p className="notice">Account creation is not active yet. Secure authentication and verification will be connected in the next development stage.</p>
    </section>
    <a className="back-home" href="/">← Back to WANANO</a>
  </main>;
}
