import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AUTH_UI_TEXT, MOCK_ACCESS_TOKEN } from '../constants/auth'
import { STORAGE_KEYS } from '../constants/storage'

const STORAGE_KEY = STORAGE_KEYS.authSession

interface AuthStoreState {
  isAuthenticated: boolean
  accessToken?: string
  nickname?: string
}

interface AuthStoreActions {
  loginMock: (nickname?: string) => void
  logoutMock: () => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: undefined,
      nickname: undefined,
      loginMock: (nickname = AUTH_UI_TEXT.defaultMockNickname) => {
        set({
          isAuthenticated: true,
          accessToken: MOCK_ACCESS_TOKEN,
          nickname,
        })
      },
      logoutMock: () => {
        set({
          isAuthenticated: false,
          accessToken: undefined,
          nickname: undefined,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
