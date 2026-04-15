import type { IngredientGroup, ProductCategory, SkinType } from '../types/domain'

export interface SurveyOption {
  value: number
  label: string
}

export interface SurveyQuestion {
  questionId: number
  text: string
  options: readonly SurveyOption[]
}

export interface SurveyAnswer {
  questionId: number
  value: number
}

export interface SurveySubmitPayload {
  answers: SurveyAnswer[]
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

export interface RecommendedProduct {
  productId: number
  name: string
  category: ProductCategory
  imageUrl: string
  reason: string
}

export interface RoutineGuide {
  category: ProductCategory
  guide: string
}

export interface FullResult extends PreviewResult {
  resultId: number
  recommendedProducts: RecommendedProduct[]
  routine: RoutineGuide[]
}

export type SubmitOutcome =
  | { kind: 'preview'; result: PreviewResult }
  | { kind: 'full'; result: FullResult }
