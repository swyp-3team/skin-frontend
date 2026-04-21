import type { Concern, IngredientGroup, ProductCategory, SkinType } from '../types/domain'

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

export interface TopIngredientGroup {
  group: IngredientGroup
  score?: number
  priority: number
  ingredients: string[]
  reason: string
}

export interface PreviewResult {
  skinType: SkinType
  summary: string
  top3: TopIngredientGroup[]
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

export interface ResultProductItem {
  productId: number
  name: string
  brand: string
  category: ProductCategory
  price: number
  imageUrl: string | null
}

export interface ResultProductsPageData {
  tags: string[]
  skinResultDate: string
  products: ResultProductItem[]
  hasNext: boolean
}

export interface ResultProductsQuery {
  skinResultId: number
  page: number
}

export interface ProductDetail extends RecommendedProduct {
  brandName: string
  price: number
  priceAsOf: string
  featureTags: [string, string, string]
  description: string
  purchaseUrl: string
}

export interface RoutineGuide {
  category: ProductCategory
  guide: string
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
}

export interface RoutineDetail {
  routineId: number
  routineType: string
  memo: string
  products: RoutineProduct[]
}

export interface RoutineGroup {
  routineGroupId: number
  title: string
  skinResultId: number
  skinType: SkinType
  summary: string
  caution: string
  amRoutine: RoutineDetail
  pmRoutine: RoutineDetail
  createdAt: string
}

export interface FullResult extends PreviewResult {
  resultId: number
  recommendedProducts: RecommendedProduct[]
  routine: RoutineGuide[]
}

export type SurveyResultInput = SurveySubmitPayload | { previewToken: string }

export type SubmitOutcome =
  | { kind: 'preview'; result: PreviewResult; previewToken: string }
  | { kind: 'full'; result: FullResult }
