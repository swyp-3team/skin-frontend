import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { RoutineGroup } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'

function isValidResultId(resultId: number): boolean {
  return Number.isFinite(resultId) && resultId > 0
}

export function useResultRoutine(resultId: number) {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery<RoutineGroup, ApiError>({
    queryKey: queryKeys.resultRoutine(resultId),
    queryFn: () => apiClient.getRoutineGroup(resultId, { accessToken }),
    enabled: isValidResultId(resultId),
    retry: false,
  })
}
