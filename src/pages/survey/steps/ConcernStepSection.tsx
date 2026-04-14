import { cn } from '../../../lib/utils'
import { CONCERN_OPTIONS } from '../../../domain/surveyConfig'
import type { Concern } from '../../../types/domain'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface ConcernStepSectionProps {
  concerns: Concern[]
  onConcernToggle: (value: Concern) => void
}

function ConcernStepSection({ concerns, onConcernToggle }: ConcernStepSectionProps) {
  return (
    <article className="flex flex-col gap-11">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold leading-[135%] text-[#1A1C18]">
          고민을 선택해주세요
        </h2>
        <p className="text-sm text-[#3A3D3B]/60">복수 선택이 가능합니다</p>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {CONCERN_OPTIONS.map((option) => {
          const checked = concerns.includes(option.value)
          return (
            <li key={option.value}>
              <label className="block h-full cursor-pointer">
                <input
                  checked={checked}
                  className="peer sr-only"
                  name="concerns"
                  onChange={() => onConcernToggle(option.value)}
                  type="checkbox"
                />
                <span className={cn(surveyOptionCardVariants({ layout: 'descriptive', selected: checked }), 'h-full')}>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs opacity-70">{option.description}</span>
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
