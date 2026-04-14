import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { apiClient } from '../../api'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'

export function useResultDetail() {
  const { id } = useParams<{ id: string }>()
  const accessToken = useAuthStore((state) => state.accessToken)

  const resultId = Number(id)

  return {
    resultId,
    ...useQuery({
      queryKey: queryKeys.result(resultId),
      queryFn: () => apiClient.getResult(resultId, { accessToken }),
      enabled: !!id && !isNaN(resultId),
      retry: false,
    }),
  }
}
