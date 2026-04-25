export interface AuthUser {
  userId: number
  nickname: string
  role: string
  profileImageUrl: string | null
}

export interface AuthState {
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
}
