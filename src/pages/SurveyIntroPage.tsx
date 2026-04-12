import { Link } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import PageHeading from '../components/common/PageHeading'
import MobilePage from '../components/MobilePage'
import { Button, buttonVariants } from '../components/ui/button'
import { LANDING_COPY } from '../constants/landing'
import { cn } from '../lib/utils'
import { useSurveyStore } from '../stores/surveyStore'

function SurveyIntroPage() {
  const resetSurvey = useSurveyStore((state) => state.resetSurvey)

  return (
    <MobilePage>
      <div className="flex min-h-[66dvh] flex-col justify-between">
        <div>
          <PageHeading className="leading-[1.4] whitespace-pre-line">{LANDING_COPY.heroHeadline}</PageHeading>
          <p className="mt-6 text-base leading-7 text-slate-600">
            {LANDING_COPY.surveyIntroDescription}
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
            {LANDING_COPY.diagnosisStartCta}
          </Link>
          <Button
            className="h-auto w-full rounded-[12px] px-4 py-3 text-sm font-medium text-slate-700"
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
