import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { apiClient } from '@/api'
import { clearIntent, readIntent } from '@/auth/postLoginIntent'
import { createResultDetailPath } from '@/app/routes'
import MobilePage from '@/components/MobilePage'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { useSurveyProgressStore } from '@/stores/surveyProgressStore'
import { useSurveyResultStore } from '@/stores/surveyResultStore'

function AuthCallbackSkeleton() {
  return (
    <MobilePage mainClassName="px-6 py-10">
      <div className="space-y-5">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="mt-4 h-32 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </MobilePage>
  )
}

function AuthCallbackError({ onGoHome }: { onGoHome: () => void }) {
  return (
    <MobilePage mainClassName="flex flex-col items-center justify-center gap-6 px-6 py-10">
      <p className="text-center text-sm leading-relaxed text-neutral-600">
        로그인 처리 중 문제가 발생했습니다.
        <br />
        다시 시도해 주세요.
      </p>
      <Button className="w-full" onClick={onGoHome} type="button" variant="dark">
        홈으로 이동
      </Button>
    </MobilePage>
  )
}

function AuthCallbackPage() {
  const [hasError, setHasError] = useState(false)
  const navigate = useNavigate()
  const handledRef = useRef(false)

  const { setUser, clearTokens, clearAuth, setAuthCheckCompleted } = useAuthStore(
    useShallow((state) => ({
      setUser: state.setUser,
      clearTokens: state.clearTokens,
      clearAuth: state.clearAuth,
      setAuthCheckCompleted: state.setAuthCheckCompleted,
    })),
  )

  const previewToken = useSurveyProgressStore((state) => state.previewToken)
  const clearPreviewResult = useSurveyProgressStore((state) => state.clearPreviewResult)
  const { setLatestResultId, clearSavedRoutine } = useSurveyResultStore(
    useShallow((state) => ({
      setLatestResultId: state.setLatestResultId,
      clearSavedRoutine: state.clearSavedRoutine,
    })),
  )

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const handleCallback = async () => {
      try {
        const user = await apiClient.getMe()
        clearTokens()
        setUser(user)
        setAuthCheckCompleted(true)
        queryClient.invalidateQueries()
      } catch {
        clearAuth()
        setAuthCheckCompleted(true)
        clearIntent()
        setHasError(true)
        return
      }

      const intent = readIntent()
      clearIntent()

      if (intent?.type === 'promote-preview' && previewToken) {
        try {
          const result = await apiClient.submitSurveyResult({ previewToken }, {})
          setLatestResultId(result.resultId)
          clearPreviewResult()
          clearSavedRoutine()
          navigate(createResultDetailPath(result.resultId), { replace: true })
        } catch {
          navigate('/', { replace: true })
        }
        return
      }

      if (intent?.type === 'return') {
        navigate(intent.returnTo, { replace: true })
        return
      }

      navigate('/', { replace: true })
    }

    handleCallback()
  }, [
    clearAuth,
    clearPreviewResult,
    clearSavedRoutine,
    clearTokens,
    navigate,
    previewToken,
    setAuthCheckCompleted,
    setLatestResultId,
    setUser,
  ])

  if (hasError) {
    return <AuthCallbackError onGoHome={() => navigate('/', { replace: true })} />
  }

  return <AuthCallbackSkeleton />
}

export default AuthCallbackPage
