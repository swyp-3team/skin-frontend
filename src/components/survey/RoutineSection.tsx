import type { RoutineItem } from './types'

interface RoutineSectionProps {
  title: string
  items: RoutineItem[]
}

function RoutineSection({ title, items }: RoutineSectionProps) {
  return (
    <div className="space-y-2 rounded-[8px] bg-card-bg p-4">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {items.map((item) => (
        <div className="flex items-start gap-3" key={item.key}>
          <span className="rounded-[8px] bg-chip-bg px-3 py-1 text-xs font-medium text-slate-800">{item.badge}</span>
          <p className="pt-0.5 text-xs leading-5 text-slate-700">{item.guide}</p>
        </div>
      ))}
    </div>
  )
}

export default RoutineSection
