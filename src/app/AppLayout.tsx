import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { apiClient } from '../api'
import { clearIntent } from '../auth/postLoginIntent'
import { addSessionExpiredListener } from '../auth/sessionEvents'
import { queryClient } from '../lib/queryClient'
import { useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'
import { APP_ROUTES } from './routes'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setAuthCheckCompleted = useAuthStore((state) => state.setAuthCheckCompleted)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const initializedRef = useRef(false)

  const clearClientAuthState = useCallback(() => {
    clearAuth()
    clearIntent()
    queryClient.clear()
    clearLatestResultId()
  }, [clearAuth, clearLatestResultId])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let isActive = true

    const bootstrapAuth = async () => {
      let authUser: Awaited<ReturnType<typeof apiClient.getMe>> | null = null
      try {
        const user = await apiClient.getMe()
        authUser = user
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

      if (!authUser) {
        return
      }

      try {
        const myPage = await apiClient.getMyPage()
        if (!isActive) return
        if (useAuthStore.getState().user?.userId !== authUser.userId) return

        const trimmedName = myPage.user.name.trim()
        const trimmedEmail = myPage.user.email.trim()

        setUser({
          ...authUser,
          name: trimmedName.length > 0 ? trimmedName : null,
          email: trimmedEmail.length > 0 ? trimmedEmail : null,
          profileImageUrl: myPage.user.profileImageUrl,
        })
      } catch {
        // 프로필 보강 실패 시 인증 상태는 유지한다.
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
    clearClientAuthState()
    apiClient.logout().catch(() => {})
  }, [location, navigate, clearClientAuthState])

  useEffect(() => {
    const unsubscribe = addSessionExpiredListener(() => {
      clearClientAuthState()
      navigate(APP_ROUTES.landing, { replace: true })
    })

    return unsubscribe
  }, [clearClientAuthState, navigate])

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-800">
      <Outlet />
    </div>
  )
}

export default AppLayout
