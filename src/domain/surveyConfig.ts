import type { IngredientGroup, ProductCategory } from '../types/domain'

export const INGREDIENT_GROUP_LABELS: Record<IngredientGroup, string> = {
  HYDRATION: '수분 공급',
  BARRIER: '장벽 강화',
  ACNE: '트러블 케어',
  SEBUM_CONTROL: '피지 조절',
  SOOTHING: '진정',
  BRIGHTENING: '브라이트닝',
  TURNOVER: '각질 케어',
  ANTI_AGING: '안티에이징',
}

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  CLEANSER: '클렌저',
  TONER: '토너',
  SERUM: '세럼',
  CREAM: '크림',
  SUNSCREEN: '선크림',
}
