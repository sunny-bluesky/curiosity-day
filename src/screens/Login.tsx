import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'
import Splash from '../components/Splash.tsx'

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return <Splash />
  if (user) return <Navigate to="/" replace />

  async function onSignIn() {
    setBusy(true)
    setError(null)
    const message = await signInWithGoogle()
    // On success the browser leaves for Google, so the state only matters on failure.
    if (message) {
      setError(message)
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <img
        src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
        alt=""
        className="h-24 w-24 rounded-3xl"
      />
      <div>
        <h1 className="text-3xl font-semibold">Curiosity Day</h1>
        <p className="mt-2 text-common-gray">Дневник удивлений</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={onSignIn}
          disabled={busy}
          className="rounded-full bg-dark-gray px-6 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {busy ? 'Переходим в Google…' : 'Войти через Google'}
        </button>
        {error && (
          <p role="alert" className="text-sm text-dark-gray">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
