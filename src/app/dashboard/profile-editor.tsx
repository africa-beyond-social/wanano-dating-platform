"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  gender: string;
  country: string;
  city: string | null;
  relationship_goal: string;
  bio: string | null;
};

const genderOptions = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function ProfileEditor({ userId, profile }: { userId: string; profile: Profile }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    gender: profile.gender ?? "",
    country: profile.country ?? "",
    city: profile.city ?? "",
    relationship_goal: profile.relationship_goal ?? "serious_relationship",
    bio: profile.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function change(field: keyof typeof form, value: string) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    const fullName = form.full_name.trim();
    const country = form.country.trim();
    const city = form.city.trim();
    const bio = form.bio.trim();

    if (fullName.length < 2 || fullName.length > 100) {
      setError("Enter a name between 2 and 100 characters.");
      return;
    }
    if (country.length < 2 || country.length > 80) {
      setError("Enter a country between 2 and 80 characters.");
      return;
    }
    if (bio.length > 500) {
      setError("Your introduction must be 500 characters or fewer.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          gender: form.gender,
          country,
          city: city || null,
          relationship_goal: form.relationship_goal,
          bio: bio || null,
        })
        .eq("id", userId)
        .select("id")
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error("Your profile was not updated. Please refresh and try again.");
      setNotice("Your profile has been saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <section id="profile" className="profile-editor member-card member-card-wide">
    <div className="profile-editor-heading">
      <div>
        <span className="member-step">01 / YOUR PROFILE</span>
        <h2>Build your introduction</h2>
        <p>Tell us a little about yourself and the relationship you hope to build. Your details are private to your account at this stage.</p>
      </div>
      <span className="profile-edit-mark" aria-hidden="true">W</span>
    </div>
    <form className="profile-form" onSubmit={handleSubmit}>
      <label>Full name
        <input value={form.full_name} onChange={e => change("full_name", e.target.value)} minLength={2} maxLength={100} autoComplete="name" required />
        <small>Use your real name. We may lock this field after identity verification.</small>
      </label>
      <div className="profile-form-row">
        <label>Gender
          <select value={form.gender} onChange={e => change("gender", e.target.value)} required>
            <option value="">Select an option</option>
            {genderOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>Relationship intention
          <select value={form.relationship_goal} onChange={e => change("relationship_goal", e.target.value)} required>
            <option value="serious_relationship">Serious relationship</option>
            <option value="marriage">Marriage</option>
          </select>
        </label>
      </div>
      <div className="profile-form-row">
        <label>Country
          <input value={form.country} onChange={e => change("country", e.target.value)} minLength={2} maxLength={80} autoComplete="country-name" required />
        </label>
        <label>City or town <span className="optional-label">Optional</span>
          <input value={form.city} onChange={e => change("city", e.target.value)} maxLength={100} autoComplete="address-level2" placeholder="e.g. Harare" />
        </label>
      </div>
      <label>About you <span className="optional-label">Optional · up to 500 characters</span>
        <textarea value={form.bio} onChange={e => change("bio", e.target.value)} maxLength={500} rows={5} placeholder="Share your values, interests and what matters to you in a lasting relationship." />
        <small className="bio-count">{form.bio.length}/500</small>
      </label>
      {error && <p className="form-alert form-error" role="alert">{error}</p>}
      {notice && <p className="form-alert form-success" role="status">{notice}</p>}
      <div className="profile-form-footer">
        <p>Your date of birth and account email cannot be changed here.</p>
        <button className="button" type="submit" disabled={saving}>{saving ? "Saving profile…" : "Save profile"} <span>↗</span></button>
      </div>
    </form>
  </section>;
}
