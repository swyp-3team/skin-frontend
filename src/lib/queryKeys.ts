import type { ResultProductTabId } from '../components/results/types'

export const queryKeys = {
  result: (resultId: number) => ['result', resultId] as const,
  resultRoutine: (resultId: number) => ['result-routine', resultId] as const,
  routineRecommendation: () => ['routine-recommendation'] as const,
  resultProducts: (resultId: number, tabId: ResultProductTabId) => ['result-products', resultId, tabId] as const,
  resultProductsSearchSource: (resultId: number, keyword: string) =>
    ['result-products-search-source', resultId, keyword] as const,
  productDetail: (id: number) => ['product', id] as const,
  profile: () => ['profile'] as const,
} as const
