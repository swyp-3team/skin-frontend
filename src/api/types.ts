import type { Concern, ProductCategory, SkinType } from '../types/domain'

export interface SurveyOption {
  optionNumber: number
  content: string
  code: SkinType | Concern | null
}

export interface SurveyQuestion {
  step: number
  question: string
  options: readonly SurveyOption[]
}

export interface SurveyAnswer {
  step: number
  answer: number
}

export interface SurveySubmitPayload {
  answers: SurveyAnswer[]
  skinType: SkinType
  concerns: Concern[]
}

export interface PreviewResult {
  diagnosedDate: string
  skinType: string
  subtitle: string
  summary: string
}

export interface PreviewApiData {
  preview: PreviewResult
  previewToken: string
}

export interface RecommendedProduct {
  productId: number
  name: string
  category: ProductCategory
  imageUrl: string | null
  reason: string
}

export interface ProductDetail extends RecommendedProduct {
  brandName: string
  price: number
  priceAsOf: string
  featureTags: [string, string, string]
  description: string
  purchaseUrl: string
}

export interface ResultIngredientMeta {
  name: string
  description: string
}

export interface ResultDetail {
  resultId: number
  diagnosedAt: string
  skinType: string
  subtitle: string
  summary: string
  concerns: string[]
  subSummary: string
  ingredientMetas: ResultIngredientMeta[]
}

export interface RoutineProduct {
  productId: number
  name: string
  brand: string
  category: ProductCategory
  imageUrl: string | null
  sortOrder: number
  reason: string
  note: string
  price: number | null
}

export interface RoutineDetail {
  routineId: number
  routineType: string
  memo: string
  products: RoutineProduct[]
}

export interface RoutineGroup {
  routineGroupId: number
  resultId: number
  skinType: SkinType
  title: string
  summary: string
  caution: string
  amRoutine: RoutineDetail
  pmRoutine: RoutineDetail
  createdAt: string
}

export interface ResultProductItem {
  productId: number
  name: string
  brand: string
  price: number
  imageUrl: string | null
}

export type ResultProductsFilterCategory =
  | 'SKIN'
  | 'TONER'
  | 'ESSENCE'
  | 'SERUM'
  | 'AMPOULE'
  | 'LOTION'
  | 'EMULSION'
  | 'CREAM'
  | 'SUN_CARE'

export interface ResultProductsPageData {
  tags: string[]
  skinResultDate: string
  products: ResultProductItem[]
  hasNext: boolean
  nextCursor: number | null
}

export interface ResultProductsQuery {
  skinResultId: number
  size: number
  cursor?: number
  categories?: ResultProductsFilterCategory[]
}

export type SurveyResultInput = SurveySubmitPayload | { previewToken: string }

export type SubmitOutcome =
  | { kind: 'preview'; result: PreviewResult; previewToken: string }
  | { kind: 'full'; result: ResultDetail }
