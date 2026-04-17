import { Button } from '../../../components/ui/button'
import { SURVEY_STEP_TEXT } from '../../../constants/survey'

interface SurveyStepActionsProps {
  currentStep: number
  isNextHighlighted: boolean
  isSubmitting: boolean
  isFinalStep: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

function SurveyStepActions({
  currentStep,
  isNextHighlighted,
  isSubmitting,
  isFinalStep,
  onPrev,
  onNext,
  onSubmit,
}: SurveyStepActionsProps) {
  return (
    <div className={`flex items-center gap-4 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
      {currentStep > 1 && (
        <Button
          className="h-12 w-18 shrink-0 rounded-full text-base font-medium text-neutral-300"
          disabled={isSubmitting}
          onClick={onPrev}
          size="page"
          type="button"
          variant="tertiary"
        >
          {SURVEY_STEP_TEXT.previous}
        </Button>
      )}

      {isFinalStep ? (
        <Button
          className="flex-1 h-12 rounded-full text-base font-semibold"
          disabled={isSubmitting}
          onClick={onSubmit}
          size="page"
          type="button"
          variant="dark"
        >
          {isSubmitting ? SURVEY_STEP_TEXT.submitPending : SURVEY_STEP_TEXT.submit}
        </Button>
      ) : (
        <Button
          className={`h-12 w-19 shrink-0 rounded-full text-base font-medium text-neutral-300 ${isNextHighlighted ? 'bg-neutral-150' : ''}`}
          onClick={onNext}
          size="page"
          type="button"
          variant="tertiary"
        >
          {SURVEY_STEP_TEXT.next}
        </Button>
      )}
    </div>
  )
}

export default SurveyStepActions
