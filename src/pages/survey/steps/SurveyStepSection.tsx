import type { SurveyOption } from '../../../api/types'
import { surveyOptionCardVariants } from './surveyStepVariants'

interface SurveyStepSectionProps {
  title: string
  name: string
  options: readonly SurveyOption[]
  isSelected: (value: number) => boolean
  /** 키보드/접근성 등 모든 입력 방식의 선택 변경 시 호출 */
  onSelect: (value: number) => void
  /** 포인터(마우스·터치) 클릭 시에만 호출 — 자동 진행 등 포인터 전용 동작에 사용 */
  onPointerSelect?: (value: number) => void
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
            const checked = isSelected(option.value)
            return (
              <li key={option.value} className="h-full">
                <label
                  className="block cursor-pointer h-full"
                  onClick={() => onPointerSelect?.(option.value)}
                  onPointerDown={onOptionPointerDown}
                  onPointerUp={onOptionPointerUp}
                  onPointerLeave={onOptionPointerUp}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    name={name}
                    onChange={() => onSelect(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span className={surveyOptionCardVariants({ selected: checked, layout: columns === 2 ? 'grid' : 'default' }) + ' h-full'}>
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
