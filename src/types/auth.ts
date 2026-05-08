export interface AuthUser {
  userId: number
  nickname: string
  role: string
  profileImageUrl: string | null
  name: string | null
  email: string | null
}
