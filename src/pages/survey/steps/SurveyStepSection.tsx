import type { SurveyOption } from '../../../api/types'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface SurveyStepSectionProps {
  title: string
  name: string
  options: readonly SurveyOption[]
  isSelected: (value: number) => boolean
  onChange: (value: number) => void
  columns?: 1 | 2
}

function SurveyStepSection({
  title,
  name,
  options,
  isSelected,
  onChange,
  columns = 1,
}: SurveyStepSectionProps) {
  return (
    <fieldset className="m-0 w-full border-0 p-0 flex flex-col">
      <legend className="w-full">
        <span className="flex min-h-40 items-center justify-center text-2xl font-bold leading-[135%] text-[#1A1C18] text-center">
          {title}
        </span>
      </legend>
      <div className="w-full pt-1 items-center flex-1 justify-center self-center">
        <ul className={columns === 2 ? 'grid h-[42dvh] grid-cols-2 gap-3 grid-rows-4' : 'flex flex-col gap-3'}>
          {options.map((option) => {
            const checked = isSelected(option.value)
            return (
              <li key={option.value} className="h-full">
                <label className="block cursor-pointer h-full">
                  <input
                    checked={checked}
                    className="sr-only"
                    name={name}
                    onChange={() => onChange(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span className={surveyOptionCardVariants({ selected: checked }) + ' h-full'}>
                    {option.label}
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
