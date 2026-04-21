import type { SurveyOption } from '../../../api/types'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface SurveyStepSectionProps {
  title: string
  name: string
  options: readonly SurveyOption[]
  isSelected: (optionNumber: number) => boolean
  onSelect: (optionNumber: number) => void
  onPointerSelect?: (optionNumber: number) => void
  onOptionPointerDown?: () => void
  onOptionPointerUp?: () => void
  columns?: 1 | 2
}

function SurveyStepSection({
  title,
  name,
  options,
  isSelected,
  onSelect,
  onPointerSelect,
  onOptionPointerDown,
  onOptionPointerUp,
  columns = 1,
}: SurveyStepSectionProps) {
  return (
    <fieldset className="m-0 w-full border-0 p-0 flex flex-col">
      <legend className="w-full">
        <span className="flex min-h-40 items-center justify-center text-2xl font-bold leading-[135%] text-neutral-800 text-center">
          {title}
        </span>
      </legend>
      <div className="w-full pt-1 items-center flex-1 justify-center self-center text-neutral-600">
        <ul className={columns === 2 ? 'grid grid-cols-2 gap-3 grid-rows-4 min-h-[288px]' : 'flex flex-col gap-3'}>
          {options.map((option) => {
            const checked = isSelected(option.optionNumber)
            return (
              <li key={option.optionNumber} className="h-full">
                <label
                  className="block cursor-pointer h-full"
                  onClick={() => onPointerSelect?.(option.optionNumber)}
                  onPointerDown={onOptionPointerDown}
                  onPointerUp={onOptionPointerUp}
                  onPointerLeave={onOptionPointerUp}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    name={name}
                    onChange={() => onSelect(option.optionNumber)}
                    type="radio"
                    value={option.optionNumber}
                  />
                  <span
                    className={surveyOptionCardVariants({ selected: checked, layout: columns === 2 ? 'grid' : 'default' }) + ' h-full'}
                  >
                    {option.content}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>
    </fieldset>
  )
}

export default SurveyStepSection
