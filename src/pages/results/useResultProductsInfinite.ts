import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { ResultProductsPageData } from '../../api/types'
import type { ResultProductTabId } from '../../components/results/types'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'
import { getResultProductsCategoriesByTab } from './resultViewModel'

const RECOMMENDED_PRODUCTS_PAGE_SIZE = 10

function isValidResultId(resultId: number): boolean {
  return Number.isFinite(resultId) && resultId > 0
}

export function useResultProductsInfinite(resultId: number, tabId: ResultProductTabId) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const categories = getResultProductsCategoriesByTab(tabId)

  return useInfiniteQuery<ResultProductsPageData, ApiError>({
    queryKey: queryKeys.resultProducts(resultId, tabId),
    queryFn: ({ pageParam }) =>
      apiClient.getRecommendedProducts(
        {
          skinResultId: resultId,
          size: RECOMMENDED_PRODUCTS_PAGE_SIZE,
          cursor: typeof pageParam === 'number' ? pageParam : undefined,
          categories: categories.length > 0 ? [...categories] : undefined,
        },
        { accessToken },
      ),
    enabled: isValidResultId(resultId),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined),
    placeholderData: keepPreviousData,
    retry: false,
  })
}
