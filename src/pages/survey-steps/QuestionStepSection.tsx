import type { SurveyQuestion } from '../../api/types'
import PageHeading from '../../components/common/PageHeading'
import { cn } from '../../lib/utils'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface QuestionStepSectionProps {
  activeQuestion: SurveyQuestion
  answersByQuestionId: Record<number, number>
  onAnswerChange: (questionId: number, value: number) => void
}

function QuestionStepSection({ activeQuestion, answersByQuestionId, onAnswerChange }: QuestionStepSectionProps) {
  return (
    <article className="space-y-4">
      <PageHeading>{activeQuestion.text}</PageHeading>
      <ul className="space-y-2">
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
                <span className={cn(surveyOptionCardVariants({ selected: checked }))}>{option.label}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default QuestionStepSection
