import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { clearIntent, readIntent } from '@/auth/postLoginIntent'
import { createResultDetailPath } from '@/app/routes'
import { apiClient } from '@/api'
import { Skeleton } from '@/components/ui/skeleton'
import MobilePage from '@/components/MobilePage'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useSurveyProgressStore } from '@/stores/surveyProgressStore'
import { useSurveyResultStore } from '@/stores/surveyResultStore'
import { queryClient } from '@/lib/queryClient'

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
  const [searchParams] = useSearchParams()

  const { setTokens, setUser } = useAuthStore(
    useShallow((s) => ({ setTokens: s.setTokens, setUser: s.setUser })),
  )
  const previewToken = useSurveyProgressStore((s) => s.previewToken)
  const clearPreviewResult = useSurveyProgressStore((s) => s.clearPreviewResult)
  const { setLatestResultId, clearSavedRoutine } = useSurveyResultStore(
    useShallow((s) => ({ setLatestResultId: s.setLatestResultId, clearSavedRoutine: s.clearSavedRoutine })),
  )

  // 엄격 모드 이중 실행 방지
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    async function handleCallback() {
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')

      if (!accessToken || !refreshToken) {
        setHasError(true)
        return
      }

      try {
        setTokens(accessToken, refreshToken)
        const user = await apiClient.getMe(accessToken)
        setUser(user)
        queryClient.invalidateQueries()
      } catch {
        // getMe 실패 시 토큰은 유지하고 홈으로 이동
        const intent = readIntent()
        clearIntent()
        navigate(intent?.type === 'return' ? intent.returnTo : '/', { replace: true })
        return
      }

      const intent = readIntent()
      clearIntent()

      if (intent?.type === 'promote-preview' && previewToken) {
        try {
          const result = await apiClient.submitSurveyResult({ previewToken }, { accessToken })
          setLatestResultId(result.resultId)
          clearPreviewResult()
          clearSavedRoutine()
          navigate(createResultDetailPath(result.resultId), { replace: true })
        } catch {
          // 승격 실패 시 홈으로
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (hasError) {
    return <AuthCallbackError onGoHome={() => navigate('/', { replace: true })} />
  }

  return <AuthCallbackSkeleton />
}

export default AuthCallbackPage
