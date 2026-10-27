-- 0003: one marker (shape + color) per user per day. Rows are never deleted together with entries.
-- Safe to run more than once. Run in Supabase: SQL Editor -> paste -> Run.

create table if not exists public.day_markers (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  shape text not null,
  color text not null,
  primary key (user_id, day)
);

alter table public.day_markers enable row level security;

drop policy if exists "day_markers_select_own" on public.day_markers;
create policy "day_markers_select_own" on public.day_markers
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "day_markers_insert_own" on public.day_markers;
create policy "day_markers_insert_own" on public.day_markers
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Needed later for manual marker settings (P1).
drop policy if exists "day_markers_update_own" on public.day_markers;
create policy "day_markers_update_own" on public.day_markers
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Safety check: fail loudly if RLS or policies are missing.
do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'day_markers' and c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on public.day_markers';
  end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'day_markers') < 3 then
    raise exception 'Expected 3 policies on public.day_markers';
  end if;
end $$;
