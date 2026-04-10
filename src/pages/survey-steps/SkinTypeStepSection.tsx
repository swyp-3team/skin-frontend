import { SKIN_TYPE_OPTIONS } from '../../domain/surveyConfig'
import type { SkinTypeSelection } from '../../types/domain'

interface SkinTypeStepSectionProps {
  skinType: SkinTypeSelection | null
  onSkinTypeChange: (value: SkinTypeSelection) => void
}

function SkinTypeStepSection({ skinType, onSkinTypeChange }: SkinTypeStepSectionProps) {
  return (
    <article className="space-y-4">
      <h2 className="text-page-title leading-[1.35] font-semibold tracking-tight text-slate-950">
        피부 타입을 선택해주세요
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {SKIN_TYPE_OPTIONS.map((option) => {
          const checked = skinType === option.value

          return (
            <li key={option.value}>
              <label className="block cursor-pointer">
                <input
                  checked={checked}
                  className="peer sr-only"
                  name="skinType"
                  onChange={() => onSkinTypeChange(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span
                  className={`block rounded-[10px] border px-3 py-3 transition ${
                    checked ? 'border-slate-900 bg-[#d1d1d1]' : 'border-card-border bg-card-bg'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{option.description}</span>
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
