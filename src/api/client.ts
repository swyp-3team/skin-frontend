import type { AuthState } from '../types/auth'
import type {
  FullResult,
  PreviewApiData,
  ProductDetail,
  ResultDetail,
  ResultProductsPageData,
  ResultProductsQuery,
  RoutineGroup,
  SurveyQuestion,
  SurveyResultInput,
  SurveySubmitPayload,
} from './types'

export interface ApiClient {
  getSurveyQuestions(): Promise<SurveyQuestion[]>
  submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewApiData>
  submitSurveyResult(input: SurveyResultInput, authState: AuthState): Promise<FullResult>
  getResult(resultId: number, authState: AuthState): Promise<ResultDetail>
  getRoutineGroup(skinResultId: number, authState: AuthState): Promise<RoutineGroup>
  getRecommendedProducts(query: ResultProductsQuery, authState: AuthState): Promise<ResultProductsPageData>
  getProductDetail(productId: number): Promise<ProductDetail>
}
