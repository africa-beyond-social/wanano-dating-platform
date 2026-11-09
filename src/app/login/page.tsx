"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../auth.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(searchParams.get("message") === "confirmation_failed" ? "Your confirmation link could not be completed. Please request a new one or try again." : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (signInError) throw signInError;
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not log you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-shell">
    <Link className="brand" href="/"><span className="brand-mark"><span>W</span></span><span>WANANO</span></Link>
    <section className="auth-card">
      <div className="eyebrow">Welcome back</div>
      <h1>Log in to WANANO</h1>
      <p>Your next meaningful connection begins with intention.</p>
      <form onSubmit={handleSubmit}>
        <label>Email address<input autoComplete="email" type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
        <label>Password<input autoComplete="current-password" type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required /></label>
        {error && <p className="form-alert form-error" role="alert">{error}</p>}
        {message && <p className="form-alert form-success" role="status">{message}</p>}
        <button className="button form-button" type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"} <span>↗</span></button>
      </form>
      <div className="auth-note">New to WANANO? <Link href="/register">Create an account</Link></div>
      <p className="notice">If you have just registered, confirm your email address before logging in.</p>
    </section>
    <Link className="back-home" href="/">← Back to WANANO</Link>
  </main>;
}
