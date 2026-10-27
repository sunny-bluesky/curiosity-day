-- 0004: handle_new_user() is only a sign-up trigger; nobody should be able to call it through the API.
-- Safe to run more than once. Run in Supabase: SQL Editor -> paste -> Run.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
