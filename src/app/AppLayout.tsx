import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { apiClient } from '../api'
import { clearIntent } from '../auth/postLoginIntent'
import { queryClient } from '../lib/queryClient'
import { useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setAuthCheckCompleted = useAuthStore((state) => state.setAuthCheckCompleted)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let isActive = true

    const bootstrapAuth = async () => {
      try {
        const user = await apiClient.getMe()
        if (!isActive) return
        setUser(user)
      } catch {
        if (!isActive) return
        clearAuth()
      } finally {
        if (isActive) {
          setAuthCheckCompleted(true)
        }
      }
    }

    bootstrapAuth()

    return () => {
      isActive = false
    }
  }, [clearAuth, setAuthCheckCompleted, setUser])

  useEffect(() => {
    if (!location.state?.pendingLogout) return
    navigate(location.pathname, { replace: true, state: null })
    clearAuth()
    clearIntent()
    queryClient.clear()
    clearLatestResultId()
    clearSavedRoutine()
    apiClient.logout().catch(() => {})
  }, [location, navigate, clearAuth, clearLatestResultId, clearSavedRoutine])

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-800">
      <Outlet />
    </div>
  )
}

export default AppLayout
