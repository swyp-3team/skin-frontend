import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../constants/storage'
import type { AuthUser } from '../types/auth'

interface AuthStoreState {
  user?: AuthUser
  authCheckCompleted: boolean
}

interface AuthStoreActions {
  setUser: (user: AuthUser) => void
  setAuthCheckCompleted: (completed: boolean) => void
  clearAuth: () => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const selectIsAuthenticated = (state: AuthStoreState) => state.user !== undefined

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: undefined,
      authCheckCompleted: false,
      setUser: (user) => {
        set({ user })
      },
      setAuthCheckCompleted: (completed) => {
        set({ authCheckCompleted: completed })
      },
      clearAuth: () => {
        set({ user: undefined, authCheckCompleted: true })
      },
    }),
    {
      name: STORAGE_KEYS.authSession,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)
