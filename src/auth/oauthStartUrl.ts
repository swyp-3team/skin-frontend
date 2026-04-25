import type { OAuthProvider } from '../constants/auth'
import { AUTH_PROVIDERS } from '../constants/auth'
import { env } from '../lib/env'

function getOAuthBase(): string {
  if (env.VITE_OAUTH_BASE_URL) {
    return env.VITE_OAUTH_BASE_URL
  }

  // VITE_API_BASE_URL에서 origin 추출 (절대 URL인 경우)
  try {
    const url = new URL(env.VITE_API_BASE_URL)
    return url.origin
  } catch {
    // 상대 경로인 경우 현재 origin 사용
    return window.location.origin
  }
}

export function buildOAuthStartUrl(provider: OAuthProvider): string {
  const base = getOAuthBase()
  const providerPath = AUTH_PROVIDERS[provider].providerPath
  const url = new URL(`${base}/oauth2/authorization/${providerPath}`)

  // TODO: TEMPORARY — 백엔드가 redirect_uri 없이 동작하게 되면 아래 3줄 삭제
  const redirectUri = `${window.location.origin}/oauth/callback`
  url.searchParams.set('redirect_uri', redirectUri)
  // END TEMPORARY

  return url.toString()
}
