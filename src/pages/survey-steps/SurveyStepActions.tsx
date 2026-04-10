interface SurveyStepActionsProps {
  currentStep: number;
  isSubmitting: boolean;
  isFinalStep: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
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
      <button
        className="flex-1 rounded-[10px] border border-card-border bg-card-bg px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-50"
        disabled={currentStep === 1 || isSubmitting}
        onClick={onPrev}
        type="button"
      >
        이전
      </button>

      {isFinalStep ? (
        <button
          className="flex-1 rounded-[999px] bg-cta px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSubmitting}
          onClick={onSubmit}
          type="button"
        >
          {isSubmitting ? "제출 중..." : "결과 확인하기"}
        </button>
      ) : (
        <button
          className="flex-1 rounded-[999px] bg-cta px-4 py-3 text-sm font-semibold text-white"
          onClick={onNext}
          type="button"
        >
          다음
        </button>
      )}
    </div>
  );
}

export default SurveyStepActions;
