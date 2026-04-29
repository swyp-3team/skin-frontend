import { Link, useLocation } from 'react-router-dom'

import { APP_ROUTES } from '@/app/routes'
import PageHeading from '../../components/common/PageHeading'
import PageHeader from '../../components/common/PageHeader'
import MobilePage from '../../components/MobilePage'
import { buttonVariants } from '../../components/ui/button'
import { LANDING_COPY } from '../../constants/landing'
import { isSurveyIntroEntryState } from '../../constants/surveyEntry'
import { cn } from '../../lib/utils'

const SURVEY_INTRO_HEADLINE = {
  default: '피부 진단하기',
  routine: '진단 결과를 바탕으로\n루틴을 안내해드릴게요!',
  products: '진단 결과를 바탕으로\n맞는 제품을 찾아드릴게요!',
} as const

function SurveyIntroPage() {
  const location = useLocation()
  const introEntryPoint = isSurveyIntroEntryState(location.state) ? location.state.surveyEntryPoint : null
  const heading =
    introEntryPoint === 'routine'
      ? SURVEY_INTRO_HEADLINE.routine
      : introEntryPoint === 'products'
        ? SURVEY_INTRO_HEADLINE.products
        : SURVEY_INTRO_HEADLINE.default

  return (
    <MobilePage header={<PageHeader showLogo className="bg-common-0" />} className="bg-common-0">
      <div className="h-[60dvh] w-full flex items-center justify-center">
        <PageHeading
          className="text-center whitespace-pre-line text-[24px] font-medium leading-[32.4px] tracking-normal text-neutral-800"
          size="md"
        >
          {heading}
        </PageHeading>
      </div>

      <div className="w-full px-7">
        <div>
          <Link
            className={cn(
              buttonVariants({ variant: 'dark' }),
              'h-12 w-full rounded-full px-6 text-center text-[16px] font-medium',
            )}
            to={APP_ROUTES.surveySteps}
          >
            {LANDING_COPY.diagnosisStartCta}
          </Link>
        </div>
      </div>
    </MobilePage>
  )
}

export default SurveyIntroPage
