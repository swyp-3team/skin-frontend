import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { RoutineRecommendationWithToken } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'

export function useRoutineRecommendation() {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery<RoutineRecommendationWithToken, ApiError>({
    queryKey: queryKeys.routineRecommendation(),
    queryFn: () => apiClient.getRoutineRecommendation({ accessToken }),
    retry: false,
  })
}
