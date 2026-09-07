-- EestiRoll — accounts setup
--
-- Run this whole file in the Supabase SQL Editor once you're ready to turn
-- on accounts. It's idempotent-ish (safe to re-run), except the policy
-- reset in Part 1, which intentionally drops and recreates every policy on
-- `subscribers` and `feedback` — review Part 1's comment before running.

-- =============================================================
-- Part 1 — Fix subscribers/feedback RLS for signed-in users
-- =============================================================
-- Today these tables accept inserts from the `anon` role. Once a user signs
-- in, the same client sends an `authenticated` JWT instead, so any policy
-- scoped `TO anon` stops applying and their inserts start failing with an
-- RLS error. This resets both tables to a single insert-only policy open to
-- both anon and authenticated, and — just as importantly — leaves no SELECT
-- policy on either table, so nobody can read the subscriber email list or
-- other people's feedback back out through the API.
--
-- This drops ALL existing policies on these two tables before recreating
-- them. If you've added other policies here beyond the original
-- insert-only one, back them up first.

do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'subscribers'
  loop
    execute format('drop policy %I on public.subscribers', pol.policyname);
  end loop;

  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'feedback'
  loop
    execute format('drop policy %I on public.feedback', pol.policyname);
  end loop;
end $$;

alter table public.subscribers enable row level security;
alter table public.feedback enable row level security;

create policy "insert_subscribers" on public.subscribers
  for insert to anon, authenticated with check (true);

create policy "insert_feedback" on public.feedback
  for insert to anon, authenticated with check (true);


-- =============================================================
-- Part 2 — Profiles table
-- =============================================================
-- One row per signed-in user, auto-created by a trigger on auth.users.
-- Not read by the app yet, but gives delete_account() (Part 3) and any
-- future per-user feature a place to hang data off of.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Deliberately no insert policy: rows are only ever created by the trigger
-- below, running as the table owner (security definer), never directly by
-- a client.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
-- Part 3 — Account deletion (required by Apple guideline 5.1.1(v)
-- once the app has accounts)
-- =============================================================
-- Deletes the profile, any subscriber row matching the account's email,
-- and the auth.users row itself. Feedback rows are left alone on purpose —
-- they carry no user_id column today, so there's nothing to unlink; if a
-- user_id is ever added to `feedback`, make it
-- `references auth.users(id) on delete set null` so deleting an account
-- preserves the feedback text while dropping the identity, rather than
-- destroying it.

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  uemail text;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select email into uemail from auth.users where id = uid;

  delete from public.subscribers where lower(email) = lower(uemail);
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;


-- =============================================================
-- Part 4 — History sync table (NOT wired up in the app yet — v1.1)
-- =============================================================
-- The client is local-history-only for now (see the account feature's
-- design notes). This table is here so the shape is decided ahead of time;
-- it's safe to run now even though nothing writes to it yet.

create table if not exists public.history_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_timestamp bigint not null,
  words jsonb not null,
  sentence text not null,
  note text,
  ai jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, client_timestamp)
);

alter table public.history_entries enable row level security;

create index if not exists history_entries_user_ts_idx
  on public.history_entries (user_id, client_timestamp desc);

drop policy if exists "history_select_own" on public.history_entries;
create policy "history_select_own" on public.history_entries
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "history_insert_own" on public.history_entries;
create policy "history_insert_own" on public.history_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "history_update_own" on public.history_entries;
create policy "history_update_own" on public.history_entries
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "history_delete_own" on public.history_entries;
create policy "history_delete_own" on public.history_entries
  for delete to authenticated using ((select auth.uid()) = user_id);
