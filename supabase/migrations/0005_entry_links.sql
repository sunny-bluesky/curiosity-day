-- 0005: links between a conclusion and the entries it was written from.
-- Deleting a source entry removes only the link; deleting a conclusion removes its links.
-- Links are set when the conclusion is created and are never edited (no update policy).
-- Safe to run more than once. Run in Supabase: SQL Editor -> paste -> Run.

create table if not exists public.entry_links (
  conclusion_id uuid not null references public.entries (id) on delete cascade,
  source_id uuid not null references public.entries (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conclusion_id, source_id),
  check (conclusion_id <> source_id)
);

create index if not exists entry_links_source_idx on public.entry_links (source_id);
create index if not exists entry_links_user_idx on public.entry_links (user_id);

alter table public.entry_links enable row level security;

drop policy if exists "entry_links_select_own" on public.entry_links;
create policy "entry_links_select_own" on public.entry_links
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Both entries must belong to the user (entries are only visible to their owner through RLS),
-- and the conclusion side must really be a conclusion.
drop policy if exists "entry_links_insert_own" on public.entry_links;
create policy "entry_links_insert_own" on public.entry_links
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.entries c
      where c.id = conclusion_id and c.user_id = (select auth.uid()) and c.type = 'conclusion'
    )
    and exists (
      select 1 from public.entries s
      where s.id = source_id and s.user_id = (select auth.uid())
    )
  );

drop policy if exists "entry_links_delete_own" on public.entry_links;
create policy "entry_links_delete_own" on public.entry_links
  for delete to authenticated
  using (user_id = (select auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'entry_links' and c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on public.entry_links';
  end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'entry_links') < 3 then
    raise exception 'Expected 3 policies on public.entry_links';
  end if;
end $$;
