import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth.ts'
import { supabase } from '../lib/supabase.ts'

// Temporary stage-1 screen: shows who is signed in, read from the profiles table (RLS-protected).
export default function Home() {
  const { user, signOut } = useAuth()
  const [name, setName] = useState<string | null>(null)
  const [profileError, setProfileError] = useState(false)

  const userId = user?.id
  useEffect(() => {
    if (!supabase || !userId) return
    let active = true
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setProfileError(true)
        else setName(data?.display_name ?? null)
      })
    return () => {
      active = false
    }
  }, [userId])

  const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined
  const shownName = name ?? meta?.full_name ?? meta?.name ?? user?.email ?? ''

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold">Привет, {shownName}!</h1>
      <p className="text-common-gray">Вход работает. Дальше здесь появится дневник.</p>
      {profileError && (
        <p className="text-sm text-common-gray">
          Профиль пока не загрузился. Проверьте, что в Supabase применена миграция.
        </p>
      )}
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-full bg-light-gray px-6 py-3 text-base font-medium"
      >
        Выйти
      </button>
    </main>
  )
}
