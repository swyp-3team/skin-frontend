// Mock 로그인 흐름에서 실제 서버 토큰 대신 재사용하는 고정 access token 값입니다.
export const MOCK_ACCESS_TOKEN = 'mock-access-token' as const

// 비인증 사용자를 리다이렉트할 때 location.state에 남기는 인증 필요 사유 식별자입니다.
export const AUTH_REDIRECT_REASON = 'AUTH_REQUIRED' as const

// 로그인 후 원래 보려던 화면을 안내하거나 복귀시키기 위한 라우터 state 형태입니다.
export interface AuthRedirectState {
  redirectReason: typeof AUTH_REDIRECT_REASON
  from: string
}

// 외부 입력인 location.state가 인증 리다이렉트 payload인지 안전하게 판별하는 타입 가드입니다.
export function isAuthRedirectState(value: unknown): value is AuthRedirectState {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (!('redirectReason' in value) || !('from' in value)) {
    return false
  }

  return value.redirectReason === AUTH_REDIRECT_REASON && typeof value.from === 'string'
}
