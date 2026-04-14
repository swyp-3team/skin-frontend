import { cn } from '../../../lib/utils'
import { SKIN_TYPE_OPTIONS } from '../../../domain/surveyConfig'
import type { SkinTypeSelection } from '../../../types/domain'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface SkinTypeStepSectionProps {
  skinType: SkinTypeSelection | null
  onSkinTypeChange: (value: SkinTypeSelection) => void
}

function SkinTypeStepSection({ skinType, onSkinTypeChange }: SkinTypeStepSectionProps) {
  return (
    <article className="flex flex-col gap-11">
      <h2 className="text-2xl font-bold leading-[135%] text-[#1A1C18] text-center">
        피부 타입을 선택해주세요
      </h2>
      <ul className="grid grid-cols-2 gap-3">
        {SKIN_TYPE_OPTIONS.map((option) => {
          const checked = skinType === option.value
          return (
            <li key={option.value}>
              <label className="block h-full cursor-pointer">
                <input
                  checked={checked}
                  className="peer sr-only"
                  name="skinType"
                  onChange={() => onSkinTypeChange(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span className={cn(surveyOptionCardVariants({ layout: 'descriptive', selected: checked }), 'h-full')}>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-[1.5] opacity-70">{option.description}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default SkinTypeStepSection
