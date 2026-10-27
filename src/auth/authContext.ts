import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  user: User | null
  /** true until the stored session has been checked on startup */
  loading: boolean
  /** returns an error text (Russian) or null if the redirect to Google started */
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
