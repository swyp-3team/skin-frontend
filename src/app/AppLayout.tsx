import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

import { apiClient } from '../api'
import { env } from '../lib/env'
import { useAuthStore } from '../stores/authStore'

function AppLayout() {
  const setUser = useAuthStore((state) => state.setUser)
  const clearTokens = useAuthStore((state) => state.clearTokens)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const setAuthCheckCompleted = useAuthStore((state) => state.setAuthCheckCompleted)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let isActive = true

    const bootstrapAuth = async () => {
      try {
        const user = await apiClient.getMe()
        if (!isActive) return
        if (env.VITE_API_MODE === 'live') {
          clearTokens()
        }
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
  }, [clearAuth, clearTokens, setAuthCheckCompleted, setUser])

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-800">
      <Outlet />
    </div>
  )
}

export default AppLayout
