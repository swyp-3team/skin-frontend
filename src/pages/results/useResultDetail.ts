import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { ResultDetail } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'

export function useResultDetail() {
  const { id } = useParams<{ id: string }>()
  const accessToken = useAuthStore((state) => state.accessToken)

  const resultId = Number(id)

  return {
    resultId,
    ...useQuery<ResultDetail, ApiError>({
      queryKey: queryKeys.result(resultId),
      queryFn: () => apiClient.getResult(resultId, { accessToken }),
      enabled: !!id && !isNaN(resultId),
      retry: false,
    }),
  }
}
