import { Button } from '../../components/ui/button'
import { SURVEY_STEP_TEXT } from '../../constants/survey'

interface SurveyStepActionsProps {
  currentStep: number
  isSubmitting: boolean
  isFinalStep: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

function SurveyStepActions({
  currentStep,
  isSubmitting,
  isFinalStep,
  onPrev,
  onNext,
  onSubmit,
}: SurveyStepActionsProps) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        className="h-auto flex-1 rounded-[10px] px-4 py-3 text-sm font-semibold"
        disabled={currentStep === 1 || isSubmitting}
        onClick={onPrev}
        type="button"
        variant="surface"
      >
        {SURVEY_STEP_TEXT.previous}
      </Button>

      {isFinalStep ? (
        <Button
          className="h-auto flex-1 rounded-full px-4 py-3 text-sm disabled:opacity-60"
          disabled={isSubmitting}
          onClick={onSubmit}
          type="button"
          variant="cta"
        >
          {isSubmitting ? SURVEY_STEP_TEXT.submitPending : SURVEY_STEP_TEXT.submit}
        </Button>
      ) : (
        <Button className="h-auto flex-1 rounded-full px-4 py-3 text-sm" onClick={onNext} type="button" variant="cta">
          {SURVEY_STEP_TEXT.next}
        </Button>
      )}
    </div>
  )
}

export default SurveyStepActions
