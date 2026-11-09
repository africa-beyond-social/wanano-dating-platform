"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("Zimbabwe");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!accepted) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    const dob = new Date(dateOfBirth + "T00:00:00");
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (!dateOfBirth || Number.isNaN(dob.getTime()) || dob > cutoff) {
      setError("WANANO is for adults aged 18 and older. Please check your date of birth.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
          data: {
            full_name: fullName.trim(),
            date_of_birth: dateOfBirth,
            gender,
            country,
            terms_accepted: true
          }
        }
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Your account request has been received. Check your email for the confirmation link before logging in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-shell">
    <Link className="brand" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></Link>
    <section className="auth-card">
      <div className="eyebrow">Begin with intention</div>
      <h1>Create your account</h1>
      <p>Join a community built around verified identities and meaningful relationships. WANANO is for adults aged 18 and older.</p>
      <form onSubmit={handleSubmit}>
        <label>Full name<input autoComplete="name" name="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" minLength={2} maxLength={100} required /></label>
        <label>Email address<input autoComplete="email" type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
        <label>Date of birth<input type="date" name="dateOfBirth" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0,10)} required /></label>
        <label>Gender<select name="gender" value={gender} onChange={e => setGender(e.target.value)} required><option value="">Select an option</option><option value="woman">Woman</option><option value="man">Man</option><option value="non_binary">Non-binary</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
        <label>Country<select name="country" value={country} onChange={e => setCountry(e.target.value)} required><option>Zimbabwe</option><option>South Africa</option><option>Zambia</option><option>Botswana</option><option>Malawi</option><option>Mozambique</option><option>Namibia</option><option>Other</option></select></label>
        <label>Create password<input autoComplete="new-password" type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 10 characters" minLength={10} required /></label>
        <label className="check-row"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required /> I confirm that I am 18 or older and agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</label>
        {error && <p className="form-alert form-error" role="alert">{error}</p>}
        {message && <p className="form-alert form-success" role="status">{message}</p>}
        <button className="button form-button" type="submit" disabled={loading}>{loading ? "Creating your account…" : "Create account"} <span>↗</span></button>
      </form>
      <div className="auth-note">Already registered? <Link href="/login">Log in</Link></div>
      <p className="notice">Email confirmation is required. Identity verification and matchmaking will be introduced after account setup.</p>
    </section>
    <Link className="back-home" href="/">← Back to WANANO</Link>
  </main>;
}
