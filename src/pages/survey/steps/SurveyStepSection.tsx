import type { SurveyOption } from '../../../api/types'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface SurveyStepSectionProps<TValue extends string | number> {
  title: string
  name: string
  options: readonly SurveyOption<TValue>[]
  isSelected: (value: TValue) => boolean
  onChange: (value: TValue) => void
  columns?: 1 | 2
  inputType?: 'radio' | 'checkbox'
}

function SurveyStepSection<TValue extends string | number>({
  title,
  name,
  options,
  isSelected,
  onChange,
  columns = 1,
  inputType = 'radio',
}: SurveyStepSectionProps<TValue>) {
  return (
    <fieldset className="m-0 w-full border-0 p-0 flex flex-col">
      <legend className="w-full">
        <span className="flex min-h-40 items-center justify-center text-2xl font-bold leading-[135%] text-[#1A1C18] text-center">
          {title}
        </span>
      </legend>
      <div className="pt-6 w-full">
        <ul className={columns === 2 ? 'grid grid-cols-2 grid-rows-4 gap-3 h-70 auto-rows-fr' : 'flex flex-col gap-3 h-66'}>
          {options.map((option) => {
            const checked = isSelected(option.value)
            return (
              <li key={String(option.value)} className='h-full'>
                <label className="block cursor-pointer h-full">
                  <input
                    checked={checked}
                    className="sr-only"
                    name={name}
                    onChange={() => onChange(option.value)}
                    type={inputType}
                    value={String(option.value)}
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
