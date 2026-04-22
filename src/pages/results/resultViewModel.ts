import type { ProductCategory } from '../../types/domain'
import type { ResultSummary } from '../../api/types'
import type { ResultHeaderViewModel, ResultProductTabId, ResultProductTabItem } from '../../components/results/types'

const PRODUCT_CATEGORY_TO_TAB: Record<ProductCategory, ResultProductTabId | null> = {
  CLEANSER: null,
  TONER: 'SKIN_TONER',
  SERUM: 'ESSENCE_SERUM_AMPOULE',
  CREAM: 'CREAM',
  SUNSCREEN: 'SUNCARE',
}

export const RESULT_PRODUCT_TABS: readonly ResultProductTabItem[] = [
  { id: 'ALL', label: '전체' },
  { id: 'SKIN_TONER', label: '스킨/토너' },
  { id: 'ESSENCE_SERUM_AMPOULE', label: '에센스/세럼/앰플' },
  { id: 'LOTION_EMULSION', label: '로션/에멀전' },
  { id: 'CREAM', label: '크림' },
  { id: 'SUNCARE', label: '선케어' },
] as const

export function createResultHeaderViewModelFromSummary(summary: ResultSummary): ResultHeaderViewModel {
  return {
    diagnosisTitle: summary.title,
    summary: summary.summaryShort,
    tags: [summary.badge.label],
    diagnosedAt: summary.createdAt,
  }
}

export function mapCategoryToResultTab(category: ProductCategory): ResultProductTabId | null {
  return PRODUCT_CATEGORY_TO_TAB[category]
}

export function isProductVisibleInTab(category: ProductCategory, activeTab: ResultProductTabId): boolean {
  if (activeTab === 'ALL') {
    return true
  }

  return mapCategoryToResultTab(category) === activeTab
}
