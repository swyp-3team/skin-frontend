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
  'h-12 rounded-full border border-[#EDEEED] bg-[#F8F9F7] text-base font-medium text-[#3A3D3B] transition-opacity disabled:opacity-40'

function SurveyStepActions({
  currentStep,
  isSubmitting,
  isFinalStep,
  onPrev,
  onNext,
  onSubmit,
}: SurveyStepActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        className={`${pillBase} w-[76px] shrink-0`}
        disabled={currentStep === 1 || isSubmitting}
        onClick={onPrev}
        type="button"
      >
        {SURVEY_STEP_TEXT.previous}
      </button>

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
          className={`${pillBase} w-[76px] shrink-0`}
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
