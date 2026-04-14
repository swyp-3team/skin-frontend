import { Link } from 'react-router-dom'

import { APP_ROUTES } from '../../app/routes'
import PageHeading from '../../components/common/PageHeading'
import MobilePage from '../../components/MobilePage'
import { Button, buttonVariants } from '../../components/ui/button'
import { LANDING_COPY } from '../../constants/landing'
import { SURVEY_PAGE_TITLE } from '../../constants/survey'
import { cn } from '../../lib/utils'
import { useSurveyStore } from '../../stores/surveyStore'

function SurveyIntroPage() {
  const resetSurvey = useSurveyStore((state) => state.resetSurvey)

  return (
    <MobilePage
    headingLeft={null}
    headingCenter={SURVEY_PAGE_TITLE}
    headingRight={null}
    className="bg-[#CCEEED]"
    >
        <div className='w-full flex items-center justify-center h-[63dvh]'>
          <PageHeading size="md" className="text-center whitespace-pre-line">{LANDING_COPY.heroHeadline}</PageHeading>
        </div>

        <div className="w-full bottom-0 space-y-4 px-4">
          <div>
            <Link
              className={cn(
                buttonVariants({ variant: 'cta' }),
                'text-xl font-medium h-14 w-full rounded-full px-6 py-4 text-center',
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
