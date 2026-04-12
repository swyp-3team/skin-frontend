import { Link } from 'react-router-dom'

import { APP_ROUTES, createRoutineDetailPath } from '../app/routes'
import SurfaceCard from '../components/common/SurfaceCard'
import MobilePage from '../components/MobilePage'
import { Button, buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT } from '../constants/auth'
import { LANDING_COPY } from '../constants/landing'
import { SURVEY_STATUS_MESSAGES } from '../constants/survey'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { useSurveyStore } from '../stores/surveyStore'

function MyPage() {
  const logoutMock = useAuthStore((state) => state.logoutMock)
  const nickname = useAuthStore((state) => state.nickname)
  const result = useSurveyStore((state) => state.lastResult)

  return (
    <MobilePage
      rightSlot={
        <Button
          className="h-auto rounded-[10px] px-3 py-1.5 text-xs font-semibold text-slate-700"
          onClick={logoutMock}
          type="button"
          variant="surface"
        >
          {AUTH_UI_TEXT.logout}
        </Button>
      }
    >
      <section className="space-y-5">
        <SurfaceCard>
          <p className="text-xs text-slate-500">안녕하세요</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {nickname ?? AUTH_UI_TEXT.defaultMockNickname}님
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">최신 피부 진단</h2>
          {result ? (
            <>
              <p className="text-sm text-slate-700">피부 타입: {result.skinType}</p>
              <p className="text-sm text-slate-600">{result.summary}</p>
              <Link
                className={cn(buttonVariants({ variant: 'cta' }), 'h-auto rounded-full px-4 py-2 text-sm')}
                to={APP_ROUTES.surveyResult}
              >
                {SURVEY_STATUS_MESSAGES.viewResultCta}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">아직 저장된 결과가 없습니다.</p>
              <Link
                className={cn(buttonVariants({ variant: 'cta' }), 'h-auto rounded-full px-4 py-2 text-sm')}
                to={APP_ROUTES.survey}
              >
                {LANDING_COPY.surveyStartCta}
              </Link>
            </>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">나의 루틴</h2>
          <Link
            className="flex items-center justify-between rounded-[10px] border border-card-border bg-white px-3 py-3 text-sm text-slate-700"
            to={createRoutineDetailPath(1)}
          >
            <span>최근 루틴 상세</span>
            <span className="text-slate-400">›</span>
          </Link>
        </SurfaceCard>
      </section>
    </MobilePage>
  )
}

export default MyPage
