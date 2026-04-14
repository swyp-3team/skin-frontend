import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES } from '../../app/routes'
import AlertMessage from '../../components/common/AlertMessage'
import PageHeading from '../../components/common/PageHeading'
import MobilePage from '../../components/MobilePage'
import RoutineSection from '../../components/survey/RoutineSection'
import { Button, buttonVariants } from '../../components/ui/button'
import { SURVEY_RESULT_COPY } from '../../constants/survey'
import { cn } from '../../lib/utils'
import { createSavedRoutineKey, useSurveyStore } from '../../stores/surveyStore'
import { toRoutineItems } from '../survey/result/toRoutineItems'
import { useResultDetail } from './useResultDetail'

function ResultRoutinePage() {
  const { data: result, isLoading, error } = useResultDetail()
  const { savedRoutineKey, markRoutineSaved } = useSurveyStore(
    useShallow((state) => ({
      savedRoutineKey: state.savedRoutineKey,
      markRoutineSaved: state.markRoutineSaved,
    })),
  )

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          결과를 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !result) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '결과를 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const currentRoutineKey = createSavedRoutineKey(result)
  const isRoutineSaved = savedRoutineKey === currentRoutineKey

  return (
    <MobilePage>
      <section className="space-y-7 pb-10">
        <PageHeading>{SURVEY_RESULT_COPY.routinePageTitle}</PageHeading>

        <div className="space-y-3">
          <RoutineSection items={toRoutineItems(result, 'am')} title={SURVEY_RESULT_COPY.amRoutineTitle} />
          <RoutineSection items={toRoutineItems(result, 'pm')} title={SURVEY_RESULT_COPY.pmRoutineTitle} />
        </div>

        {!isRoutineSaved ? (
          <Button
            className="h-auto w-full rounded-full px-6 py-3 text-sm"
            onClick={() => markRoutineSaved(result)}
            type="button"
            variant="cta"
          >
            {SURVEY_RESULT_COPY.saveRoutineCta}
          </Button>
        ) : (
          <Link
            className={cn(
              buttonVariants({ variant: 'cta' }),
              'h-auto w-full rounded-full px-6 py-3 text-center text-sm',
            )}
            to={APP_ROUTES.myPage}
          >
            {SURVEY_RESULT_COPY.routineSavedCta}
          </Link>
        )}
      </section>
    </MobilePage>
  )
}

export default ResultRoutinePage
