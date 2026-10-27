import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.tsx'
import RequireAuth from './auth/RequireAuth.tsx'
import { isSupabaseConfigured } from './lib/supabase.ts'
import Home from './screens/Home.tsx'
import Login from './screens/Login.tsx'
import Splash from './components/Splash.tsx'

// On wide screens the app is a fixed-width column (up to 480 px) centered on the page.
export default function App() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px]">
      {isSupabaseConfigured ? (
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      ) : (
        <Splash text="Приложение не настроено: нет ключей Supabase." />
      )}
    </div>
  )
}
