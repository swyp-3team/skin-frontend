import type { Concern, IngredientGroup, ProductCategory, SkinType } from '../types/domain'

export interface SurveyOption<TValue extends string | number = string> {
  value: TValue
  label: string
  description?: string
}

export type SurveyQuestionOption = SurveyOption<number>

export interface SurveyQuestion {
  questionId: number
  text: string
  options: SurveyQuestionOption[]
}

export interface SurveyDescriptiveStep {
  title: string
  options: SurveyOption<string>[]
}

export interface SurveyStepConfig {
  skinTypeStep: SurveyDescriptiveStep
  concernStep: SurveyDescriptiveStep
}

export interface SurveyQuestionsResponse {
  questions: SurveyQuestion[]
}

export interface SurveyAnswer {
  questionId: number
  value: number
}

export interface SurveySubmitPayload {
  answers: SurveyAnswer[]
  skinType: SkinType
  concerns: Concern[]
}

export type SurveyResultPayload = SurveySubmitPayload | { resultId: number }

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
