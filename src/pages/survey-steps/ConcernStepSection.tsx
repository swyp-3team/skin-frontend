import PageHeading from '../../components/common/PageHeading'
import { cn } from '../../lib/utils'
import { CONCERN_OPTIONS } from '../../domain/surveyConfig'
import type { Concern } from '../../types/domain'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface ConcernStepSectionProps {
  concerns: Concern[]
  onConcernToggle: (value: Concern) => void
}

function ConcernStepSection({ concerns, onConcernToggle }: ConcernStepSectionProps) {
  return (
    <article className="space-y-4">
      <PageHeading>고민을 선택해주세요</PageHeading>
      <p className="text-sm text-slate-600">복수 선택이 가능합니다.</p>
      <ul className="grid grid-cols-2 gap-2">
        {CONCERN_OPTIONS.map((option) => {
          const checked = concerns.includes(option.value)
          return (
            <li key={option.value}>
              <label className="block cursor-pointer">
                <input
                  checked={checked}
                  className="peer sr-only"
                  name="concerns"
                  onChange={() => onConcernToggle(option.value)}
                  type="checkbox"
                />
                <span className={cn(surveyOptionCardVariants({ layout: 'descriptive', selected: checked }))}>
                  <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-1 block text-xs text-slate-600">{option.description}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default ConcernStepSection
