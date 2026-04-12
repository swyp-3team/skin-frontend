import type { RoutineItem } from './types'
import SurfaceCard from '../common/SurfaceCard'

interface RoutineSectionProps {
  title: string
  items: RoutineItem[]
}

function RoutineSection({ title, items }: RoutineSectionProps) {
  return (
    <SurfaceCard className="space-y-2" density="compact">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {items.map((item) => (
        <div className="flex items-start gap-3" key={item.key}>
          <span className="rounded-[8px] bg-chip-bg px-3 py-1 text-xs font-medium text-slate-800">{item.badge}</span>
          <p className="pt-0.5 text-xs leading-5 text-slate-700">{item.guide}</p>
        </div>
      ))}
    </SurfaceCard>
  )
}

export default RoutineSection
