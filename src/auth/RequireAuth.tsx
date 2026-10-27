import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.ts'
import Splash from '../components/Splash.tsx'

// Wraps every screen that needs a signed-in user.
export default function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
