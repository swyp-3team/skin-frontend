import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { APP_ROUTES } from './routes'
import { AUTH_REDIRECT_REASON } from '../constants/auth'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  redirectTo?: string
}

function ProtectedRoute({ redirectTo = APP_ROUTES.home }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate replace state={{ redirectReason: AUTH_REDIRECT_REASON, from: location.pathname }} to={redirectTo} />
    )
  }

  return <Outlet />
}

export default ProtectedRoute
