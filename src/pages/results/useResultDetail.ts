import { queryOptions, useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { ResultDetail } from '../../api/types'
import type { ResultHeaderViewModel } from '../../components/results/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'
import { createResultHeaderViewModel } from './resultViewModel'

function isValidResultId(resultId: number): boolean {
  return Number.isFinite(resultId) && resultId > 0
}

export function getResultDetailQueryOptions(resultId: number, accessToken?: string) {
  return queryOptions<ResultDetail, ApiError>({
    queryKey: queryKeys.result(resultId),
    queryFn: () => apiClient.getResult(resultId, { accessToken }),
    enabled: isValidResultId(resultId),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useResultDetail(resultId: number) {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery(getResultDetailQueryOptions(resultId, accessToken))
}

export function useResultHeader(resultId: number) {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery<ResultDetail, ApiError, ResultHeaderViewModel>({
    ...getResultDetailQueryOptions(resultId, accessToken),
    select: createResultHeaderViewModel,
  })
}
