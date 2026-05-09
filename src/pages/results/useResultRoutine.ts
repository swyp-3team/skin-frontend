import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { RoutineRecommendationWithToken } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'

export function useRoutineRecommendation(resultId: number) {
  return useQuery<RoutineRecommendationWithToken, ApiError>({
    queryKey: queryKeys.routineRecommendation(resultId),
    queryFn: () => apiClient.getRoutineRecommendation(resultId),
    retry: false,
  })
}
