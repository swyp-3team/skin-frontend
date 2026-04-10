import type { FullResult, PreviewResult } from '../../api/types'
import type { RoutineItem } from '../../components/survey/types'
import { isFullResult } from './guards'

type RoutinePeriod = 'am' | 'pm'

export function toRoutineItems(result: PreviewResult | FullResult, period: RoutinePeriod): RoutineItem[] {
  if (isFullResult(result)) {
    return result.routine.slice(0, 3).map((item, index) => ({
      key: `${period}-${index + 1}`,
      badge: item.category,
      guide: item.guide,
    }))
  }

  return result.top3.slice(0, 3).map((item, index) => ({
    key: `${period}-${index + 1}`,
    badge: `STEP ${index + 1}`,
    guide: `${item.ingredients[0]} 중심으로 ${item.reason}`,
  }))
}
