import type { SurveyQuestion } from "../../api/types";

interface QuestionStepSectionProps {
  activeQuestion: SurveyQuestion;
  answersByQuestionId: Record<number, number>;
  onAnswerChange: (questionId: number, value: number) => void;
}

function QuestionStepSection({
  activeQuestion,
  answersByQuestionId,
  onAnswerChange,
}: QuestionStepSectionProps) {
  return (
    <article className="space-y-4">
      <h2 className="text-page-title leading-[1.35] font-semibold tracking-tight text-slate-950">
        {activeQuestion.text}
      </h2>
      <ul className="space-y-2">
        {activeQuestion.options.map((option) => {
          const checked = answersByQuestionId[activeQuestion.questionId] === option.value;
          return (
            <li key={`${activeQuestion.questionId}-${option.value}`}>
              <label className="block cursor-pointer">
                <input
                  checked={checked}
                  className="peer sr-only"
                  name={`question-${activeQuestion.questionId}`}
                  onChange={() => onAnswerChange(activeQuestion.questionId, option.value)}
                  type="radio"
                  value={option.value}
                />
                <span
                  className={`block rounded-[10px] border px-4 py-3 text-sm font-medium transition ${
                    checked
                      ? "border-slate-900 bg-[#d1d1d1] text-slate-950"
                      : "border-card-border bg-card-bg text-slate-700"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default QuestionStepSection;
