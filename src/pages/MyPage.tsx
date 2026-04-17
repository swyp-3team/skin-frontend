import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { apiClient } from '../api'
import { APP_ROUTES, createResultDetailPath, createRoutineDetailPath } from '../app/routes'
import SectionTitle from '../components/common/SectionTitle'
import SurfaceCard from '../components/common/SurfaceCard'
import MobilePage from '../components/MobilePage'
import { buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT } from '../constants/auth'
import { LANDING_COPY } from '../constants/landing'
import { SURVEY_STATUS_MESSAGES } from '../constants/survey'
import { queryKeys } from '../lib/queryKeys'
import { cn } from '../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'
import { useSurveyStore } from '../stores/surveyStore'

function MyPage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const nickname = useAuthStore((state) => state.nickname)
  const latestResultId = useSurveyStore((state) => state.latestResultId)

  const { data: result } = useQuery({
    queryKey: queryKeys.result(latestResultId!),
    queryFn: () => apiClient.getResult(latestResultId!, { accessToken }),
    enabled: isAuthenticated && latestResultId != null,
  })

  return (
    <MobilePage>
      <section className="space-y-5">
        <SurfaceCard>
          <p className="text-xs text-neutral-400">안녕하세요</p>
          <p className="mt-1 text-xl font-semibold text-neutral-800">
            {nickname ?? AUTH_UI_TEXT.defaultMockNickname}님
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <SectionTitle size="lg">최신 피부 진단</SectionTitle>
          {result && latestResultId != null ? (
            <>
              <p className="text-sm text-neutral-600">피부 타입: {result.skinType}</p>
              <p className="text-sm text-neutral-500">{result.summary}</p>
              <Link
                className={cn(buttonVariants({ variant: 'dark' }), 'h-auto rounded-full px-4 py-2 text-sm')}
                to={createResultDetailPath(latestResultId)}
              >
                {SURVEY_STATUS_MESSAGES.viewResultCta}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-500">아직 저장된 결과가 없습니다.</p>
              <Link
                className={cn(buttonVariants({ variant: 'dark' }), 'h-auto rounded-full px-4 py-2 text-sm')}
                to={APP_ROUTES.survey}
              >
                {LANDING_COPY.surveyStartCta}
              </Link>
            </>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <SectionTitle size="lg">나의 루틴</SectionTitle>
          <Link
            className={cn(
              buttonVariants({ variant: 'tertiary' }),
              'h-auto w-full justify-between rounded-[10px] bg-white px-3 py-3 text-sm',
            )}
            to={createRoutineDetailPath(1)}
          >
            <span>최근 루틴 상세</span>
            <span className="text-neutral-300">›</span>
          </Link>
        </SurfaceCard>
      </section>
    </MobilePage>
  )
}

export default MyPage
