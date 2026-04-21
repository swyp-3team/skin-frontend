import { useInfiniteQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { ResultProductsPageData } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'

function isValidSkinResultId(skinResultId: number): boolean {
  return Number.isFinite(skinResultId) && skinResultId > 0
}

export function useResultProductsInfinite(skinResultId: number) {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useInfiniteQuery<ResultProductsPageData, ApiError>({
    queryKey: queryKeys.resultProducts(skinResultId),
    queryFn: ({ pageParam }) =>
      apiClient.getRecommendedProducts(
        {
          skinResultId,
          page: Number(pageParam),
        },
        { accessToken },
      ),
    enabled: isValidSkinResultId(skinResultId),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    retry: false,
  })
}
