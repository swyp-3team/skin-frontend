import type { OAuthProvider } from '../constants/auth'
import { AUTH_PROVIDERS } from '../constants/auth'
import { env } from '../lib/env'

function getOAuthBase(): string {
  if (env.VITE_OAUTH_BASE_URL) {
    return env.VITE_OAUTH_BASE_URL
  }

  try {
    const url = new URL(env.VITE_API_BASE_URL)
    return url.origin
  } catch {
    return window.location.origin
  }
}

export function buildOAuthStartUrl(provider: OAuthProvider): string {
  const base = getOAuthBase()
  const providerPath = AUTH_PROVIDERS[provider].providerPath
  const url = new URL(`${base}/oauth2/authorization/${providerPath}`)

  return url.toString()
}
