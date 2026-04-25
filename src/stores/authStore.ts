import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../constants/storage'
import type { AuthUser } from '../types/auth'

interface AuthStoreState {
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
}

interface AuthStoreActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  clearAuth: () => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const selectIsAuthenticated = (state: AuthStoreState) => state.accessToken !== undefined

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      user: undefined,
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },
      setUser: (user) => {
        set({ user })
      },
      clearAuth: () => {
        set({ accessToken: undefined, refreshToken: undefined, user: undefined })
      },
    }),
    {
      name: STORAGE_KEYS.authSession,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
