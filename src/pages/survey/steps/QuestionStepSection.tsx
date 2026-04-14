import type { SurveyQuestion } from '../../../api/types'
import { cn } from '../../../lib/utils'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface QuestionStepSectionProps {
  activeQuestion: SurveyQuestion
  answersByQuestionId: Record<number, number>
  onAnswerChange: (questionId: number, value: number) => void
}

function QuestionStepSection({ activeQuestion, answersByQuestionId, onAnswerChange }: QuestionStepSectionProps) {
  return (
    <article className="grid gap-12 [grid-template-rows:64px_auto]">
      <h2 className="min-h-12 text-2xl font-bold leading-[135%] text-[#1A1C18] text-center">
        {activeQuestion.text}
      </h2>
      <ul className="grid grid-cols gap-3">
        {activeQuestion.options.map((option) => {
          const checked = answersByQuestionId[activeQuestion.questionId] === option.value
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
                <span className={cn(surveyOptionCardVariants({ selected: checked }))}>
                  {option.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default QuestionStepSection
