import RoutineItem from '../common/RoutineItem'
import SectionTitle from '../common/SectionTitle'
import SurfaceCard from '../common/SurfaceCard'
import type { RoutineItem as RoutineItemType } from './types'

interface RoutineSectionProps {
  title: string
  items: RoutineItemType[]
}

function RoutineSection({ title, items }: RoutineSectionProps) {
  return (
    <SurfaceCard className="space-y-2" density="compact">
      <SectionTitle>{title}</SectionTitle>
      {items.map((item) => (
        <RoutineItem badge={item.badge} guide={item.guide} key={item.key} />
      ))}
    </SurfaceCard>
  )
}

export default RoutineSection
