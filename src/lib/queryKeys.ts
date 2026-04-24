import type { ResultProductTabId } from '../components/results/types'

export const queryKeys = {
  result: (resultId: number) => ['result', resultId] as const,
  resultRoutine: (resultId: number) => ['result-routine', resultId] as const,
  resultProducts: (resultId: number, tabId: ResultProductTabId) => ['result-products', resultId, tabId] as const,
  productDetail: (id: number) => ['product', id] as const,
} as const
