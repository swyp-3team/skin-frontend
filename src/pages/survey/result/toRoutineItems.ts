import type { FullResult } from '../../../api/types'
import type { RoutineItem } from '../../../components/survey/types'

type RoutinePeriod = 'am' | 'pm'

export function toRoutineItems(result: FullResult, period: RoutinePeriod): RoutineItem[] {
  return result.routine.slice(0, 3).map((item, index) => ({
    key: `${period}-${index + 1}`,
    badge: item.category,
    guide: item.guide,
  }))
}
