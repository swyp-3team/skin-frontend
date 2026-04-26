import type { AuthState, AuthUser } from '../types/auth'
import type {
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
  submitSurveyResult(input: SurveyResultInput, authState: AuthState): Promise<ResultDetail>
  getResult(resultId: number, authState: AuthState): Promise<ResultDetail>
  getRoutineGroup(resultId: number, authState: AuthState): Promise<RoutineGroup>
  getRoutineRecommendation(authState: AuthState): Promise<RoutineRecommendationWithToken>
  saveRoutine(request: SaveRoutineRequest, authState: AuthState): Promise<SaveRoutineResponse>
  getRecommendedProducts(query: ResultProductsQuery, authState: AuthState): Promise<ResultProductsPageData>
  getProductDetail(productId: number): Promise<ProductDetail>
  getProfile(authState: AuthState): Promise<ProfileData>

  // 인증 메서드
  getMe(accessToken?: string): Promise<AuthUser>
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }>
  logout(accessToken?: string): Promise<void>
}
