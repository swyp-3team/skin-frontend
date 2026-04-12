import { Link } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import PageHeading from '../components/common/PageHeading'
import MobilePage from '../components/MobilePage'
import { Button, buttonVariants } from '../components/ui/button'
import { cn } from '../lib/utils'
import { useSurveyStore } from '../stores/surveyStore'

function SurveyIntroPage() {
  const resetSurvey = useSurveyStore((state) => state.resetSurvey)

  return (
    <MobilePage>
      <div className="flex min-h-[66dvh] flex-col justify-between">
        <div>
          <PageHeading className="leading-[1.4] whitespace-pre-line">
            피부 고민을 입력하면{'\n'}나에게 맞는 성분과{'\n'}루틴을 알려드려요
          </PageHeading>
          <p className="mt-6 text-base leading-7 text-slate-600">
            설문 단계별 응답은 자동 저장되며, 마지막 단계에서 결과를 조회합니다.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            className={cn(
              buttonVariants({ variant: 'cta' }),
              'text-xl font-medium h-auto w-full rounded-xl px-6 py-4 text-center shadow-[var(--shadow-cta)]'
            )}
            to={APP_ROUTES.surveySteps}
          >
            피부 진단 시작하기
          </Link>
          <Button
            className="h-auto w-full rounded-[12px] px-4 py-3 text-sm font-medium text-slate-700"
            onClick={resetSurvey}
            type="button"
            variant="surface"
          >
            설문 상태 초기화
          </Button>
        </div>
      </div>
    </MobilePage>
  )
}

export default SurveyIntroPage
