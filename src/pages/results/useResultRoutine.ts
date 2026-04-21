import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { RoutineGroup } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'

function isValidSkinResultId(skinResultId: number): boolean {
  return Number.isFinite(skinResultId) && skinResultId > 0
}

export function useResultRoutine(skinResultId: number) {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery<RoutineGroup, ApiError>({
    queryKey: queryKeys.routineGroup(skinResultId),
    queryFn: () => apiClient.getRoutineGroup(skinResultId, { accessToken }),
    enabled: isValidSkinResultId(skinResultId),
    retry: false,
  })
}
