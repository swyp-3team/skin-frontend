import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { APP_ROUTES } from './routes'
import { AUTH_REDIRECT_REASON } from '../constants/auth'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

function ProtectedRoute({ children, redirectTo = APP_ROUTES.home }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate replace state={{ redirectReason: AUTH_REDIRECT_REASON, from: location.pathname }} to={redirectTo} />
    )
  }

  return children
}

export default ProtectedRoute
