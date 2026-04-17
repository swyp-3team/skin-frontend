// 로그인 다이얼로그의 표시 맥락을 나타내는 variant 타입입니다.
export type LoginDialogVariant = 'default' | 'result'

// subtitleSub가 있으면 subtitle은 헤딩(Neutral-800), subtitleSub는 서브텍스트(Neutral-400)로 렌더링됩니다.
export type LoginDialogCopy = {
  subtitle: string
  subtitleSub?: string
}

// variant별 UI 문구 맵 — Record 타입으로 명시해 subtitleSub를 공통 구조로 유지합니다.
export const LOGIN_DIALOG_COPY: Record<LoginDialogVariant, LoginDialogCopy> = {
  default: {
    subtitle: '간편 로그인으로 나에게 맞는 스킨케어 루틴을 시작해 보세요.',
  },
  result: {
    subtitle: '로그인하고 결과를 저장해 보세요.',
    subtitleSub: '소셜 계정으로 간편하게 시작할 수 있어요.',
  },
}

// Mock 로그인 흐름에서 실제 서버 토큰 대신 재사용하는 고정 access token 값입니다.
export const MOCK_ACCESS_TOKEN = 'mock-access-token' as const

// 비인증 사용자를 리다이렉트할 때 location.state에 남기는 인증 필요 사유 식별자입니다.
export const AUTH_REDIRECT_REASON = 'AUTH_REQUIRED' as const

// Mock 로그인 UI와 결과 승격 흐름에서 재사용하는 provider 라벨 모음입니다.
export const AUTH_PROVIDERS = {
  google: {
    label: 'Google',
    continueLabel: '구글 계정으로 시작하기',
  },
  kakao: {
    label: 'Kakao',
    continueLabel: '카카오 계정으로 시작하기',
  },
} as const

// 인증 관련 버튼/안내 문구를 한 곳에서 관리하기 위한 UI 문자열 모음입니다.
export const AUTH_UI_TEXT = {
  defaultMockNickname: '레이어드 사용자',
  loginTitle: '로그인',
  loginDescription: '추천 제품까지 포함된 전체 결과를 확인하려면 간편 로그인으로 이어서 진행하세요.',
  processing: '로그인 처리 중...',
  resumeHint: '계정을 선택하면 현재 설문 결과 화면에서 바로 이어집니다.',
  gatedResultCta: '로그인하고 전체 결과 보기',
  logout: '로그아웃',
  mockLogin: '모의 로그인',
  mockLogout: '모의 로그아웃',
  protectedPageFallback: '보호 페이지',
  protectedPageHintSuffix: '는 로그인 후 접근할 수 있습니다.',
  termsPrefix: '로그인하면',
  termsOfService: '이용약관',
  termsSeparator: '및',
  privacyPolicy: '개인정보 처리방침',
  termsSuffixPt1: '에',
  termsSuffixPt2: '동의한 것으로 간주합니다.',
} as const

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
