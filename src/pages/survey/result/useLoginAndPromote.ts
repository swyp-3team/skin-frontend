import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAuthStore } from '../../../stores/authStore'
import { usePromotePreview } from './usePromotePreview'

export function useLoginAndPromote() {
  const { loginMock } = useAuthStore(useShallow((state) => ({ loginMock: state.loginMock })))
  const promoteMutation = usePromotePreview()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const promoteToFullResult = (providerLabel: string) => {
    loginMock(providerLabel)
    promoteMutation.mutate(undefined, {
      onSuccess: () => setIsLoginModalOpen(false),
    })
  }

  return {
    isLoginModalOpen,
    setIsLoginModalOpen,
    isPromoting: promoteMutation.isPending,
    promoteToFullResult,
  }
}
