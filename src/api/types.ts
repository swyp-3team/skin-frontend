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

export interface ProductDetail {
  productId: number
  name: string
  brand: string
  imageUrl: string | null
  description: string
  createdDate: string
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

// ── 루틴 추천 API 타입 ─────────────────────────────────────────────────────────

export type RoutineProductCategory =
  | 'SKIN'
  | 'TONER'
  | 'LOTION'
  | 'EMULSION'
  | 'ESSENCE'
  | 'SERUM'
  | 'AMPOULE'
  | 'CREAM'
  | 'SUN_CARE'

export type RoutineStepCategory = 'PREPARE' | 'INTENSIVE_CARE' | 'MOISTURIZER' | 'SUN_CARE'

export interface RoutineRecommendedProduct {
  productId: number
  name: string
  productCategory: RoutineProductCategory
  imageUrl: string | null
  routineStepCategory: RoutineStepCategory
}

export interface RoutineSection {
  routineType: 'AM' | 'PM'
  products: RoutineRecommendedProduct[]
}

export interface RoutineRecommendation {
  resultId: number
  skinType: string
  subtitle: string
  routineSummary: string
  amRoutine: RoutineSection
  pmRoutine: RoutineSection
}

export interface RoutineRecommendationWithToken {
  recommendation: RoutineRecommendation
  previewToken: string
}

export interface SaveRoutineRequest {
  title: string
  previewToken: string
}

export interface SaveRoutineResponse {
  routineGroupId: number
  title: string
  message: string
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

export interface ProfileData {
  resultId: number
  diagnosedAt: string
  skinType: string
  subtitle: string
  summary: string
}

export type SurveyResultInput = SurveySubmitPayload | { previewToken: string }

export type SubmitOutcome =
  | { kind: 'preview'; result: PreviewResult; previewToken: string }
  | { kind: 'full'; result: ResultDetail }
