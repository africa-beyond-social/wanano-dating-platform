-- WANANO manual identity verification schema (already applied to WANANO Supabase).
-- Identity files are held in a private bucket; no full ID numbers or biometric templates
-- are stored in Postgres. Admin authorization uses trusted app_metadata, never user_metadata.
create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('national_id','passport')),
  document_country text not null check (char_length(trim(document_country)) between 2 and 80),
  id_document_path text not null,
  selfie_path text not null,
  consent_accepted_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint identity_verifications_id_path_owner check (split_part(id_document_path,'/',1)=user_id::text),
  constraint identity_verifications_selfie_path_owner check (split_part(selfie_path,'/',1)=user_id::text)
);
create index if not exists identity_verifications_status_submitted_idx on public.identity_verifications(status,submitted_at desc);
create index if not exists identity_verifications_user_submitted_idx on public.identity_verifications(user_id,submitted_at desc);
create index if not exists identity_verifications_reviewed_by_idx on public.identity_verifications(reviewed_by);
alter table public.identity_verifications enable row level security;
revoke all on public.identity_verifications from anon,authenticated;
grant select on public.identity_verifications to authenticated;
grant insert(user_id,document_type,document_country,id_document_path,selfie_path,consent_accepted_at) on public.identity_verifications to authenticated;
grant update(status,review_note,reviewed_by,reviewed_at) on public.identity_verifications to authenticated;
create policy "Members can submit identity verification" on public.identity_verifications for insert to authenticated
  with check(user_id=(select auth.uid()) and consent_accepted_at is not null and status='pending' and reviewed_by is null and reviewed_at is null and review_note is null);
create policy "Members and admins can read identity verification" on public.identity_verifications for select to authenticated
  using(user_id=(select auth.uid()) or ((select auth.jwt())->'app_metadata'->>'role')='admin');
create policy "WANANO admins can review identity verification" on public.identity_verifications for update to authenticated
  using(((select auth.jwt())->'app_metadata'->>'role')='admin')
  with check(((select auth.jwt())->'app_metadata'->>'role')='admin' and status in ('pending','approved','rejected'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('identity-verification','identity-verification',false,8388608,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "Members can upload own verification files" on storage.objects for insert to authenticated
  with check(bucket_id='identity-verification' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Members and admins can read verification files" on storage.objects for select to authenticated
  using(bucket_id='identity-verification' and ((storage.foldername(name))[1]=(select auth.uid())::text or ((select auth.jwt())->'app_metadata'->>'role')='admin'));
create policy "WANANO admins can delete verification files" on storage.objects for delete to authenticated
  using(bucket_id='identity-verification' and ((select auth.jwt())->'app_metadata'->>'role')='admin');
