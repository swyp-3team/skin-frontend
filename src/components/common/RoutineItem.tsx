import { cn } from '@/lib/utils'

import Chip from './Chip'

interface RoutineItemProps {
  badge: string
  guide: string
  className?: string
}

/**
 * 루틴 단계 한 줄 — [카테고리칩] 가이드 텍스트 수평 레이아웃.
 * RoutineSection, RoutineDetailPage 등에서 공통으로 사용.
 */
function RoutineItem({ badge, guide, className }: RoutineItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Chip>{badge}</Chip>
      <p className="pt-0.5 text-xs leading-5 text-slate-700">{guide}</p>
    </div>
  )
}

export default RoutineItem
