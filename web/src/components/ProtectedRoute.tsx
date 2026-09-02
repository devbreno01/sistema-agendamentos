import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { auth } from '@/lib/auth'

export function ProtectedRoute() {
  const location = useLocation()

  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
