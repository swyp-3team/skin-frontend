import { useState } from 'react'

import { saveIntent } from '../../../auth/postLoginIntent'
import { buildOAuthStartUrl } from '../../../auth/oauthStartUrl'
import type { OAuthProvider } from '../../../constants/auth'

export function useLoginAndPromote() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const promoteToFullResult = (provider: OAuthProvider) => {
    saveIntent({ type: 'promote-preview' })
    window.location.href = buildOAuthStartUrl(provider)
  }

  return {
    isLoginModalOpen,
    setIsLoginModalOpen,
    isPromoting: false,
    promoteToFullResult,
  }
}
