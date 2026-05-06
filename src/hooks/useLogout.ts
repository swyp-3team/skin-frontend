import { useNavigate } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'

export function useLogout() {
  const navigate = useNavigate()

  return () => {
    navigate(APP_ROUTES.home, { state: { pendingLogout: true } })
  }
}
