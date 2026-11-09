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
- Government ID and biometric verification are not collected yet.
- Do not collect identity documents or verification videos until the provider, consent flow, retention policy and access controls have been implemented and tested.
- Facebook account verification must use an authorized OAuth/API flow; never ask members for Facebook passwords or claim access to private account-creation data.
- Mutual acceptance creates one exclusive matchmaking connection at a time, with immediate safety release if either member ends or blocks the connection.

## Next stages
1. Complete Vercel environment configuration and test signup/email confirmation/login.
2. Member profile editing and secure profile photos.
3. Identity verification provider and secure verification workflow.
4. Compatibility and exclusive-match engine.
5. Messaging, moderation, subscriptions and Zimbabwe-compatible payments.

The Terms and Privacy pages are initial drafts and must receive local legal review before WANANO is marketed publicly or begins processing identity documents.
