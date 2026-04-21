import type { ProductCategory, SkinType } from '../../types/domain'
import type { RoutineGroup } from '../../api/types'
import type { ResultHeaderViewModel, ResultProductTabId, ResultProductTabItem } from '../../components/results/types'

const SKIN_TYPE_TAG_LABELS: Record<SkinType, string> = {
  DRY: '건성',
  OILY: '지성',
  COMBINATION: '복합성',
  SENSITIVE: '민감성',
  UNKNOWN: '피부타입 미확인',
}

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

function toUniqueTags(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))]
}

export function createResultHeaderViewModel(routineGroup: RoutineGroup, tagsFromProducts?: readonly string[]): ResultHeaderViewModel {
  const fallbackTag = SKIN_TYPE_TAG_LABELS[routineGroup.skinType]
  const tags = toUniqueTags(tagsFromProducts && tagsFromProducts.length > 0 ? tagsFromProducts : [fallbackTag])

  return {
    diagnosisTitle: routineGroup.title,
    summary: routineGroup.summary,
    tags,
    diagnosedAt: routineGroup.createdAt,
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
