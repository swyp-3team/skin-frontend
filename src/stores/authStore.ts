import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MOCK_ACCESS_TOKEN } from "../constants/auth";

const STORAGE_KEY = "auth.mockSession";

interface AuthStoreState {
  isAuthenticated: boolean;
  accessToken?: string;
  nickname?: string;
}

interface AuthStoreActions {
  loginMock: (nickname?: string) => void;
  logoutMock: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: undefined,
      nickname: undefined,
      loginMock: (nickname = "레이어드 사용자") => {
        set({
          isAuthenticated: true,
          accessToken: MOCK_ACCESS_TOKEN,
          nickname,
        });
      },
      logoutMock: () => {
        set({
          isAuthenticated: false,
          accessToken: undefined,
          nickname: undefined,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
