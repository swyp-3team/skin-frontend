import type { AuthUser } from '../types/auth'
import type {
  ProductSearchPageData,
  ProductSearchQuery,
  PreviewApiData,
  ProductDetail,
  ProfileData,
  ResultDetail,
  ResultProductsPageData,
  ResultProductsQuery,
  RoutineGroup,
  RoutineRecommendationWithToken,
  SaveRoutineRequest,
  SaveRoutineResponse,
  SurveyQuestion,
  SurveyResultInput,
  SurveySubmitPayload,
} from './types'

export interface ApiClient {
  getSurveyQuestions(): Promise<SurveyQuestion[]>
  submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewApiData>
  submitSurveyResult(input: SurveyResultInput): Promise<ResultDetail>
  getResult(resultId: number): Promise<ResultDetail>
  getRoutineGroup(resultId: number): Promise<RoutineGroup>
  getRoutineRecommendation(): Promise<RoutineRecommendationWithToken>
  saveRoutine(request: SaveRoutineRequest): Promise<SaveRoutineResponse>
  getRecommendedProducts(query: ResultProductsQuery): Promise<ResultProductsPageData>
  searchProducts(query: ProductSearchQuery): Promise<ProductSearchPageData>
  getProductDetail(productId: number): Promise<ProductDetail>
  getProfile(): Promise<ProfileData>

  // 인증 메서드
  getMe(): Promise<AuthUser>
  logout(): Promise<void>
}
