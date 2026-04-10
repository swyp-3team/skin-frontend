import { CONCERN_OPTIONS } from '../../domain/surveyConfig'
import type { Concern } from '../../types/domain'

interface ConcernStepSectionProps {
  concerns: Concern[]
  onConcernToggle: (value: Concern) => void
}

function ConcernStepSection({ concerns, onConcernToggle }: ConcernStepSectionProps) {
  return (
    <article className="space-y-4">
      <h2 className="text-page-title leading-[1.35] font-semibold tracking-tight text-slate-950">
        고민을 선택해주세요
      </h2>
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
                <span
                  className={`block rounded-[10px] border px-3 py-3 transition ${
                    checked ? 'border-slate-900 bg-[#d1d1d1]' : 'border-card-border bg-card-bg'
                  }`}
                >
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
