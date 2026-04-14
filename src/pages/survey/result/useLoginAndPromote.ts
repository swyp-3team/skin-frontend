import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { createResultDetailPath } from '../../../app/routes'
import { MOCK_ACCESS_TOKEN } from '../../../constants/auth'
import { useAuthStore } from '../../../stores/authStore'
import { useSurveySubmit } from '../useSurveySubmit'

export function useLoginAndPromote() {
  const navigate = useNavigate()
  const { loginMock } = useAuthStore(useShallow((state) => ({ loginMock: state.loginMock })))
  const promoteMutation = useSurveySubmit()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const promoteToFullResult = (providerLabel: string) => {
    loginMock(providerLabel)
    promoteMutation.mutate(
      { accessToken: MOCK_ACCESS_TOKEN },
      {
        onSuccess: (outcome) => {
          if (outcome.kind === 'full') {
            // navigate 먼저: SurveyResultPage 언마운트 후 preview query 제거 (빈 프레임 방지)
            navigate(createResultDetailPath(outcome.result.resultId))
          }
          setIsLoginModalOpen(false)
        },
      },
    )
  }

  return {
    isLoginModalOpen,
    setIsLoginModalOpen,
    isPromoting: promoteMutation.isPending,
    promoteToFullResult,
  }
}
