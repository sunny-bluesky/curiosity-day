-- 0002: entries table (all three entry types), RLS, updated_at trigger.
-- Safe to run more than once. Run in Supabase: SQL Editor -> paste -> Run.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('noticed', 'did', 'conclusion')),
  title text not null default '',
  body text not null default '',
  entry_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_user_date_idx
  on public.entries (user_id, entry_date desc, created_at desc);

alter table public.entries enable row level security;

-- Each user reads and changes only their own rows.
drop policy if exists "entries_select_own" on public.entries;
create policy "entries_select_own" on public.entries
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "entries_insert_own" on public.entries;
create policy "entries_insert_own" on public.entries
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "entries_update_own" on public.entries;
create policy "entries_update_own" on public.entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "entries_delete_own" on public.entries;
create policy "entries_delete_own" on public.entries
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Keep updated_at fresh on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entries_set_updated_at on public.entries;
create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- Safety check: fail loudly if RLS or policies are missing.
do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'entries' and c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on public.entries';
  end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'entries') < 4 then
    raise exception 'Expected 4 policies on public.entries';
  end if;
end $$;
