import { Link } from 'react-router-dom'

import { APP_ROUTES } from '../../app/routes'
import PageHeading from '../../components/common/PageHeading'
import MobilePage from '../../components/MobilePage'
import { Button, buttonVariants } from '../../components/ui/button'
import { LANDING_COPY } from '../../constants/landing'
import { cn } from '../../lib/utils'
import { useSurveyStore } from '../../stores/surveyStore'

function SurveyIntroPage() {
  const resetSurvey = useSurveyStore((state) => state.resetSurvey)

  return (
    <MobilePage
    headingLeft={null}
    headingCenter={"피부 진단받기"}
    headingRight={null}
    >
      <div className="w-full flex min-h-[80dvh] flex-col items-center justify-center">
        <div className='w-full flex flex-1 items-center justify-center'>
          <PageHeading size="md" className="text-center whitespace-pre-line">{LANDING_COPY.heroHeadline}</PageHeading>
        </div>

        <div className="w-full space-y-4 px-4">
          <div>
            <Link
              className={cn(
                buttonVariants({ variant: 'cta' }),
                'text-xl font-medium h-auto w-full rounded-full px-6 py-4 text-center shadow-[var(--shadow-cta)]',
              )}
              to={APP_ROUTES.surveySteps}
            >
              {LANDING_COPY.diagnosisStartCta}
            </Link>
          </div>
          <Button
            className="h-auto w-full rounded-[10px] px-4 py-3 text-sm font-medium text-slate-700"
            onClick={resetSurvey}
            type="button"
            variant="surface"
          >
            {LANDING_COPY.resetSurveyCta}
          </Button>
        </div>
      </div>
    </MobilePage>
  )
}

export default SurveyIntroPage
