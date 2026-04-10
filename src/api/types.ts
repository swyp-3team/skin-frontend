import type {
  Concern,
  IngredientGroup,
  ProductCategory,
  SkinType,
} from "../types/domain";

export interface SurveyQuestionOption {
  value: number;
  label: string;
}

export interface SurveyQuestion {
  questionId: number;
  text: string;
  options: SurveyQuestionOption[];
}

export interface SurveyQuestionsResponse {
  questions: SurveyQuestion[];
}

export interface SurveyAnswer {
  questionId: number;
  value: number;
}

export interface SurveySubmitPayload {
  answers: SurveyAnswer[];
  skinType: SkinType;
  concerns: Concern[];
}

export interface TopIngredientGroup {
  group: IngredientGroup;
  score?: number;
  priority: number;
  ingredients: string[];
  reason: string;
}

export interface PreviewResult {
  skinType: SkinType;
  summary: string;
  top3: TopIngredientGroup[];
}

export interface RecommendedProduct {
  productId: number;
  name: string;
  category: ProductCategory;
  imageUrl: string;
  reason: string;
}

export interface RoutineGuide {
  category: ProductCategory;
  guide: string;
}

export interface FullResult extends PreviewResult {
  recommendedProducts: RecommendedProduct[];
  routine: RoutineGuide[];
}
