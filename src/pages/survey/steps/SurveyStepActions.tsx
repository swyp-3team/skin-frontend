import { SURVEY_STEP_TEXT } from '../../../constants/survey'

interface SurveyStepActionsProps {
  currentStep: number
  isSubmitting: boolean
  isFinalStep: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}

const pillBase =
  'h-12 w-18 rounded-full bg-[#EDEEED] text-base font-medium text-[#A4AAA6] transition-colors disabled:bg-[#EDEEED] disabled:text-[#A4AAA6] disabled:cursor-not-allowed'

function SurveyStepActions({
  currentStep,
  isSubmitting,
  isFinalStep,
  onPrev,
  onNext,
  onSubmit,
}: SurveyStepActionsProps) {
  return (
    <div className={`flex items-center gap-4 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
      {currentStep > 1 && (
        <button
          className={`${pillBase} shrink-0`}
          disabled={isSubmitting}
          onClick={onPrev}
          type="button"
        >
          {SURVEY_STEP_TEXT.previous}
        </button>
      )}

      {isFinalStep ? (
        <button
          className="flex-1 h-12 rounded-full bg-[#1A1C18] text-base font-semibold text-white transition-opacity disabled:opacity-60"
          disabled={isSubmitting}
          onClick={onSubmit}
          type="button"
        >
          {isSubmitting ? SURVEY_STEP_TEXT.submitPending : SURVEY_STEP_TEXT.submit}
        </button>
      ) : (
        <button
          className={`${pillBase} shrink-0`}
          onClick={onNext}
          type="button"
        >
          {SURVEY_STEP_TEXT.next}
        </button>
      )}
    </div>
  )
}

export default SurveyStepActions
