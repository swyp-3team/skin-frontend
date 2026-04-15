import { Link, useNavigate } from 'react-router-dom'

import { APP_ROUTES } from '../../app/routes'
import PageHeading from '../../components/common/PageHeading'
import MobilePage from '../../components/MobilePage'
import { CloseButton } from '../../components/MobilePageHeading'
import { Button, buttonVariants } from '../../components/ui/button'
import { LANDING_COPY } from '../../constants/landing'
import { SURVEY_PAGE_TITLE } from '../../constants/survey'
import { cn } from '../../lib/utils'
import { useSurveyStore } from '../../stores/surveyStore'

function SurveyIntroPage() {
  const navigate = useNavigate()
  const resetSurvey = useSurveyStore((state) => state.resetSurvey)

  return (
    <MobilePage
      headingClassName="w-full"
      headingCenter={SURVEY_PAGE_TITLE}
      headingRight={<CloseButton onClick={() => navigate(APP_ROUTES.home)} aria-label="설문 닫기" />}
      className="bg-[#CCEEED]"
    >
      <div className="h-[63dvh] w-full flex items-center justify-center">
        <PageHeading className="text-center whitespace-pre-line" size="md">
          {LANDING_COPY.heroHeadline}
        </PageHeading>
      </div>

      <div className="bottom-0 w-full space-y-4 px-4">
        <div>
          <Link
            className={cn(
              buttonVariants({ variant: 'cta' }),
              'h-14 w-full rounded-full px-6 py-4 text-center text-xl font-medium',
            )}
            to={APP_ROUTES.surveySteps}
          >
            {LANDING_COPY.diagnosisStartCta}
          </Link>
        </div>
        <Button
          className="w-full rounded-[10px] px-4 py-3 text-sm font-medium text-slate-700"
          onClick={resetSurvey}
          type="button"
          variant="surface"
        >
          {LANDING_COPY.resetSurveyCta}
        </Button>
      </div>
    </MobilePage>
  )
}

export default SurveyIntroPage
