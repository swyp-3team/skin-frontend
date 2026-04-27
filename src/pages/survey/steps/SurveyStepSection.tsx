import type { SurveyOption } from '../../../api/types'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface SurveyStepSectionProps {
  title: string
  name: string
  options: readonly SurveyOption[]
  isSelected: (optionNumber: number) => boolean
  onSelect: (optionNumber: number) => void
  onOptionPointerDown?: () => void
  onOptionPointerUp?: () => void
  columns?: 1 | 2
  selectionMode?: 'single' | 'multiple'
  hideTitle?: boolean
}

function SurveyStepSection({
  title,
  name,
  options,
  isSelected,
  onSelect,
  onOptionPointerDown,
  onOptionPointerUp,
  columns = 1,
  selectionMode = 'single',
  hideTitle = false,
}: SurveyStepSectionProps) {
  const inputType = selectionMode === 'multiple' ? 'checkbox' : 'radio'

  return (
    <fieldset className="m-0 w-full border-0 p-0 flex flex-col">
      {!hideTitle ? (
        <legend className="w-full">
          <span className="flex min-h-40 items-center justify-center text-2xl font-bold leading-[135%] text-neutral-800 text-center">
            {title}
          </span>
        </legend>
      ) : null}
      <div className="w-full text-neutral-600">
        <ul className={columns === 2 ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
          {options.map((option) => {
            const checked = isSelected(option.optionNumber)
            return (
              <li key={option.optionNumber} className="h-full">
                <label
                  className="block cursor-pointer h-full"
                  onPointerDown={onOptionPointerDown}
                  onPointerUp={onOptionPointerUp}
                  onPointerLeave={onOptionPointerUp}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    name={name}
                    onChange={() => onSelect(option.optionNumber)}
                    type={inputType}
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
