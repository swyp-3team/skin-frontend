import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { RoutineRecommendationWithToken } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'

export function useRoutineRecommendation() {
  return useQuery<RoutineRecommendationWithToken, ApiError>({
    queryKey: queryKeys.routineRecommendation(),
    queryFn: () => apiClient.getRoutineRecommendation(),
    retry: false,
  })
}
