import type { ResultProductTabId } from '../components/results/types'

export const queryKeys = {
  result: (resultId: number) => ['result', resultId] as const,
  resultListPreview: () => ['result-list', 'preview'] as const,
  resultListInfinite: () => ['result-list', 'infinite'] as const,
  routineRecommendation: (resultId: number) => ['routine-recommendation', resultId] as const,
  routineListPreview: () => ['routine-list', 'preview'] as const,
  routineListInfinite: () => ['routine-list', 'infinite'] as const,
  routineDetail: (routineGroupId: number) => ['routine-detail', routineGroupId] as const,
  resultProducts: (resultId: number, tabId: ResultProductTabId) => ['result-products', resultId, tabId] as const,
  resultProductsSearchSource: (resultId: number, keyword: string) =>
    ['result-products-search-source', resultId, keyword] as const,
  productDetail: (id: number) => ['product', id] as const,
  profile: () => ['profile'] as const,
} as const
