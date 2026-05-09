import { Button } from '../../../components/ui/button'
import { SURVEY_STEP_TEXT } from '../../../constants/survey'

interface SurveyStepActionsProps {
  currentStep: number
  isNextEnabled: boolean
  isOptionActive: boolean
  isSubmitting: boolean
  isFinalStep: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

function SurveyStepActions({
  currentStep,
  isNextEnabled,
  isOptionActive,
  isSubmitting,
  isFinalStep,
  onPrev,
  onNext,
  onSubmit,
}: SurveyStepActionsProps) {
  const navButtonBaseClassName =
    'h-12 shrink-0 rounded-full border border-neutral-100 bg-neutral-0 text-base font-normal hover:bg-neutral-0 active:bg-neutral-0 disabled:border-neutral-100 disabled:bg-neutral-0'
  const optionActiveClassName = isOptionActive ? 'text-neutral-800 shadow-[0_2px_8px_rgba(26,28,24,0.15)]' : ''

  return (
    <div className={`flex items-center gap-4 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
      {currentStep > 1 && (
        <Button
          className={`${navButtonBaseClassName} w-18 text-neutral-800 shadow-[0_2px_8px_rgba(26,28,24,0.15)] disabled:text-neutral-300 disabled:shadow-none ${optionActiveClassName}`}
          disabled={isSubmitting}
          onClick={onPrev}
          size="page"
          type="button"
          variant="outline"
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
          className={`${navButtonBaseClassName} w-19 ${
            isNextEnabled ? 'text-neutral-800 shadow-[0_2px_8px_rgba(26,28,24,0.15)]' : 'text-neutral-300 shadow-none'
          } ${optionActiveClassName}`}
          aria-disabled={!isNextEnabled}
          disabled={isSubmitting}
          onClick={onNext}
          size="page"
          type="button"
          variant="outline"
        >
          {SURVEY_STEP_TEXT.next}
        </Button>
      )}
    </div>
  )
}

export default SurveyStepActions
