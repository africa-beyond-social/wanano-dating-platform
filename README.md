# WANANO

WANANO is an AI-assisted relationship and marriage matchmaking platform designed around verified identities, thoughtful compatibility and meaningful connections.

## Current implementation
- Next.js frontend deployed on Vercel.
- Dedicated WANANO Supabase project.
- Email/password registration and login code.
- Email confirmation callback.
- Authenticated member dashboard.
- Profiles table with row-level security and a database-side 18+ check.
- Draft Terms of Service and Privacy Policy pages (legal review required).

## Vercel environment variables
Set both variables for Production, Preview and Development, then redeploy:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use the WANANO Supabase project URL and publishable key. Never add a Supabase secret/service-role key to a `NEXT_PUBLIC_` variable or browser code.

## Supabase Auth URL configuration
Set the Site URL to the deployed WANANO domain and add this Redirect URL:
`https://wanano-dating-platform.vercel.app/auth/callback`

For local testing, also add:
`http://localhost:3000/auth/callback`

Enable email confirmation. Configure an appropriate sender/domain before public launch.

## Local development
Requires Node.js 20 or later.
```bash
npm install
npm run dev
```

## Security and product principles
- Adults aged 18+ only; age is checked in the registration UI and database trigger.
- Profiles use Row Level Security; members can read only their own profile and update only selected non-sensitive fields. Birth date and consent timestamp cannot be changed through the member API.
- The database security and performance advisors currently report no lints.
- Manual identity verification now has a private Storage bucket, per-member RLS and an administrator review route protected by the trusted `app_metadata.role=admin` claim. The submission UI remains disabled until `NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED=true` is deliberately set after legal and retention review.
- The database stores document paths and review metadata only; it does not store full ID numbers or biometric templates. Uploaded identity documents remain sensitive personal data and require a published retention/deletion policy before intake is enabled.
- Do not collect identity documents or verification videos until the provider, consent flow, retention policy and access controls have been implemented and tested.
- Facebook account verification must use an authorized OAuth/API flow; never ask members for Facebook passwords or claim access to private account-creation data.
- Mutual acceptance creates one exclusive matchmaking connection at a time, with immediate safety release if either member ends or blocks the connection.

## Next stages
1. Complete Vercel environment configuration and test signup/email confirmation/login.
2. Member profile editing and secure profile photos.
3. Complete local privacy/legal review, retention/deletion rules, appoint authorized reviewers, then enable manual identity verification.
4. Compatibility and exclusive-match engine.
5. Messaging, moderation, subscriptions and Zimbabwe-compatible payments.

The Terms and Privacy pages are initial drafts and must receive local legal review before WANANO is marketed publicly or begins processing identity documents. The verification form is disabled by default. Before enabling it, configure a trusted administrator by setting `app_metadata.role=admin` in Supabase Auth (never user-editable metadata), publish retention/deletion details, and review consent wording with local counsel.
