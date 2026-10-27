import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Keep only the site origin, so a pasted URL with extra parts (like /rest/v1/) still works.
function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    return new URL(value.trim()).origin
  } catch {
    return undefined
  }
}

const url = normalizeUrl(rawUrl)

// Only the public (anon) key is used here. The secret service_role key must never be added to the app.
export const isSupabaseConfigured = Boolean(url && anonKey?.trim())

export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!.trim(), {
      auth: {
        // HashRouter owns the URL hash, so OAuth must return the code in the query string (PKCE),
        // not in the hash (implicit flow).
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
