import type { AuthUser } from '../types/auth'
import type {
  ProductSearchPageData,
  ProductSearchQuery,
  PreviewApiData,
  ProductDetail,
  ProfileData,
  MyPageResponse,
  ResultDetail,
  ResultListQuery,
  ResultListResponse,
  ResultProductsPageData,
  ResultProductsQuery,
  RoutineDetailResponse,
  RoutineListQuery,
  RoutineListResponse,
  RoutineRecommendationWithToken,
  SaveRoutineRequest,
  SaveRoutineResponse,
  UpdateRoutineRequest,
  UpdateRoutineResponse,
  SurveyQuestion,
  SurveyResultInput,
  SurveySubmitPayload,
} from './types'

export interface ApiClient {
  getSurveyQuestions(): Promise<SurveyQuestion[]>
  submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewApiData>
  submitSurveyResult(input: SurveyResultInput): Promise<ResultDetail>
  getResult(resultId: number): Promise<ResultDetail>
  getResultList(query?: ResultListQuery): Promise<ResultListResponse>
  getRoutineRecommendation(skinResultId?: number): Promise<RoutineRecommendationWithToken>
  saveRoutine(request: SaveRoutineRequest): Promise<SaveRoutineResponse>
  updateRoutineName(routineGroupId: number, request: UpdateRoutineRequest): Promise<UpdateRoutineResponse>
  getRoutineList(query?: RoutineListQuery): Promise<RoutineListResponse>
  getRoutineDetail(routineGroupId: number): Promise<RoutineDetailResponse>
  deleteRoutine(routineGroupId: number): Promise<void>
  withdraw(): Promise<void>
  getRecommendedProducts(query: ResultProductsQuery): Promise<ResultProductsPageData>
  searchProducts(query: ProductSearchQuery): Promise<ProductSearchPageData>
  getProductDetail(productId: number): Promise<ProductDetail>
  getProfile(resultId?: number): Promise<ProfileData>
  getMyPage(): Promise<MyPageResponse>

  // 인증 메서드
  getMe(): Promise<AuthUser>
  logout(): Promise<void>
}
