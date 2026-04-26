import type { ResultDetail, ResultProductsFilterCategory } from '../../api/types'
import type { ResultHeaderViewModel, ResultProductTabId, ResultProductTabItem } from '../../components/results/types'

const RESULT_PRODUCT_CATEGORIES_BY_TAB: Record<ResultProductTabId, readonly ResultProductsFilterCategory[]> = {
  ALL: [],
  SKIN_TONER: ['SKIN', 'TONER'],
  ESSENCE_SERUM_AMPOULE: ['ESSENCE', 'SERUM', 'AMPOULE'],
  LOTION_EMULSION: ['LOTION', 'EMULSION'],
  CREAM: ['CREAM'],
  SUNCARE: ['SUNCARE'],
}

export const RESULT_PRODUCT_TABS: readonly ResultProductTabItem[] = [
  { id: 'ALL', label: '전체' },
  { id: 'SKIN_TONER', label: '스킨/토너' },
  { id: 'ESSENCE_SERUM_AMPOULE', label: '에센스/세럼/앰플' },
  { id: 'LOTION_EMULSION', label: '로션/에멀전' },
  { id: 'CREAM', label: '크림' },
  { id: 'SUNCARE', label: '선케어' },
] as const

export function createResultHeaderViewModel(result: ResultDetail): ResultHeaderViewModel {
  return {
    diagnosisTitle: result.skinType,
    summary: result.subSummary || result.subtitle || result.summary,
    tags: result.concerns,
    diagnosedAt: result.diagnosedAt,
  }
}

export function getResultProductsCategoriesByTab(tabId: ResultProductTabId): readonly ResultProductsFilterCategory[] {
  return RESULT_PRODUCT_CATEGORIES_BY_TAB[tabId]
}
