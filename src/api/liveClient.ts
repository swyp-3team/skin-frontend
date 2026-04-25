import { isConcernCode, isSkinTypeCode } from '../domain/surveyCodes'
import type { ProductCategory } from '../types/domain'
import type { AuthState, AuthUser } from '../types/auth'
import type { ApiClient } from './client'
import type { ApiErrorPayload, ApiFieldError } from './contracts'
import { ApiError } from './errors'
import { useAuthStore } from '../stores/authStore'
import type {
  PreviewApiData,
  PreviewResult,
  ProductDetail,
  ResultDetail,
  ResultIngredientMeta,
  ResultProductsPageData,
  ResultProductsQuery,
  RoutineDetail,
  RoutineGroup,
  RoutineProduct,
  SurveyQuestion,
  SurveyResultInput,
  SurveySubmitPayload,
} from './types'

type WireRecord = Record<string, unknown>

const PRODUCT_CATEGORY_SET = new Set<ProductCategory>(['CLEANSER', 'TONER', 'SERUM', 'CREAM', 'SUNSCREEN'])

function isRecord(value: unknown): value is WireRecord {
  return typeof value === 'object' && value !== null
}

function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && PRODUCT_CATEGORY_SET.has(value as ProductCategory)
}

function toOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  if (!contentType) {
    return null
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function normalizeFieldError(raw: unknown): ApiFieldError | null {
  if (!isRecord(raw)) {
    return null
  }

  const fieldCandidate = raw.field
  const reasonCandidate = raw.reason

  if (typeof fieldCandidate !== 'string' || typeof reasonCandidate !== 'string') {
    return null
  }

  return { field: fieldCandidate, reason: reasonCandidate, rejectedValue: raw.rejectedValue }
}

function normalizeFieldErrors(raw: unknown): ApiFieldError[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined
  }

  const normalized = raw
    .map((item) => normalizeFieldError(item))
    .filter((item): item is ApiFieldError => item !== null)

  return normalized.length > 0 ? normalized : undefined
}

function parseApiErrorPayload(raw: unknown): ApiErrorPayload | undefined {
  if (!isRecord(raw)) {
    return undefined
  }

  const codeCandidate = raw.code
  const messageCandidate = raw.message
  const fieldErrors = normalizeFieldErrors(raw.fieldErrors)

  if (typeof codeCandidate !== 'string' && typeof messageCandidate !== 'string' && !fieldErrors) {
    return undefined
  }

  return {
    code: typeof codeCandidate === 'string' ? codeCandidate : 'UNKNOWN_API_ERROR',
    message: typeof messageCandidate === 'string' ? messageCandidate : 'Request processing failed.',
    fieldErrors,
  }
}

function extractApiErrorPayload(body: unknown): ApiErrorPayload | undefined {
  if (isRecord(body) && 'error' in body) {
    const nested = parseApiErrorPayload(body.error)
    if (nested) {
      return nested
    }
  }

  return parseApiErrorPayload(body)
}

function toApiError(status: number, body: unknown): ApiError {
  const parsedPayload = extractApiErrorPayload(body)
  if (parsedPayload) {
    return new ApiError(parsedPayload.message, status, parsedPayload.code, body, parsedPayload.fieldErrors)
  }

  if (typeof body === 'string' && body.trim().length > 0) {
    return new ApiError(body, status, undefined, body)
  }

  return new ApiError('Request processing failed.', status, undefined, body)
}

function unwrapEnvelope<T>(body: unknown, status: number): T {
  if (!isRecord(body) || typeof body.success !== 'boolean') {
    throw new ApiError('Response envelope is invalid. `success` field is required.', status, 'INVALID_RESPONSE_ENVELOPE', body)
  }

  if (!body.success) {
    throw toApiError(status, body)
  }

  if (!('data' in body)) {
    throw new ApiError('Response data is missing.', status, 'MISSING_RESPONSE_DATA', body)
  }

  return body.data as T
}

async function requestApi<T>(url: string, init: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(url, { ...init, headers })
  } catch (error) {
    throw new ApiError('네트워크 요청에 실패했습니다. API 연결 상태를 확인해 주세요.', 0, 'NETWORK_ERROR', error)
  }

  let body: unknown
  try {
    body = await readBody(response)
  } catch (error) {
    throw new ApiError('Response body could not be parsed.', response.status, 'INVALID_RESPONSE_BODY', error)
  }

  if (!response.ok) {
    throw toApiError(response.status, body)
  }

  if (body === null) {
    if (response.status === 204) {
      return null as T
    }

    throw new ApiError('Response body is empty.', response.status, 'EMPTY_RESPONSE_BODY')
  }

  return unwrapEnvelope<T>(body, response.status)
}

// ── 401 자동 재발급 인터셉터 ─────────────────────────────────────────────────

interface QueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

function processQueue(error: unknown, token: string | null): void {
  for (const item of failedQueue) {
    if (error) {
      item.reject(error)
    } else {
      item.resolve(token!)
    }
  }
  failedQueue = []
}

// requestWithAuth 팩토리: baseUrl을 클로저로 캡처하여 refresh 엔드포인트를 구성합니다.
// requestApi와 동일한 시그니처이지만 401 발생 시 refresh 후 1회 재시도합니다.
function createRequestWithAuth(baseUrl: string) {
  return async function requestWithAuth<T>(url: string, init: RequestInit, token?: string): Promise<T> {
    try {
      return await requestApi<T>(url, init, token)
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error
      }

      // 이미 refresh 진행 중이면 큐에 추가하고 대기
      if (isRefreshing) {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
        return requestApi<T>(url, init, newToken)
      }

      isRefreshing = true

      try {
        const { refreshToken, clearAuth } = useAuthStore.getState()

        if (!refreshToken) {
          clearAuth()
          processQueue(error, null)
          throw error
        }

        const refreshBody = await requestApi<unknown>(
          `${baseUrl}/auth/refresh`,
          {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          },
        )

        const normalized = normalizeRefreshResponse(refreshBody)
        const newAccessToken = normalized.accessToken
        useAuthStore.getState().setTokens(newAccessToken, normalized.refreshToken ?? refreshToken)

        processQueue(null, newAccessToken)
        return requestApi<T>(url, init, newAccessToken)
      } catch (refreshError) {
        useAuthStore.getState().clearAuth()
        processQueue(refreshError, null)
        throw refreshError
      } finally {
        isRefreshing = false
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function normalizeOptionCode(value: unknown) {
  if (isSkinTypeCode(value) || isConcernCode(value)) {
    return value
  }

  return null
}

function normalizeOptionNumber(optionNumber: unknown, step: number, optionIndex: number, raw: unknown): number {
  if (typeof optionNumber === 'number' && Number.isInteger(optionNumber) && optionNumber > 0) {
    return optionNumber
  }

  if (optionNumber === null) {
    return optionIndex + 1
  }

  throw new ApiError(
    `Survey option value is invalid. (step: ${step}, index: ${optionIndex})`,
    500,
    'INVALID_SURVEY_OPTION_VALUE',
    raw,
  )
}

function normalizeSurveyOption(raw: unknown, step: number, optionIndex: number) {
  if (!isRecord(raw)) {
    throw new ApiError(
      `Survey option response format is invalid. (step: ${step}, index: ${optionIndex})`,
      500,
      'INVALID_SURVEY_OPTION_FORMAT',
    )
  }

  const optionNumber = normalizeOptionNumber(raw.optionNumber, step, optionIndex, raw)
  if (typeof raw.content !== 'string') {
    throw new ApiError(
      `Survey option label is invalid. (step: ${step}, index: ${optionIndex})`,
      500,
      'INVALID_SURVEY_OPTION_LABEL',
      raw,
    )
  }

  return {
    optionNumber,
    content: raw.content,
    code: normalizeOptionCode(raw.code),
  } satisfies SurveyQuestion['options'][number]
}

function normalizeSurveyQuestion(raw: unknown, questionIndex: number): SurveyQuestion {
  if (!isRecord(raw)) {
    throw new ApiError(`Survey question format is invalid. (index: ${questionIndex})`, 500, 'INVALID_SURVEY_QUESTION_FORMAT')
  }

  if (typeof raw.step !== 'number') {
    throw new ApiError(`Survey step is invalid. (index: ${questionIndex})`, 500, 'INVALID_SURVEY_STEP', raw)
  }
  const step = raw.step
  if (typeof raw.question !== 'string') {
    throw new ApiError(`Survey question text is invalid. (step: ${step})`, 500, 'INVALID_SURVEY_TEXT', raw)
  }
  if (!Array.isArray(raw.options)) {
    throw new ApiError(`Survey options are invalid. (step: ${step})`, 500, 'INVALID_SURVEY_OPTIONS', raw)
  }

  return {
    step,
    question: raw.question,
    options: raw.options.map((option, optionIndex) => normalizeSurveyOption(option, step, optionIndex)),
  }
}

function normalizeSurveyQuestions(payload: unknown): SurveyQuestion[] {
  const questionsPayload = isRecord(payload) && Array.isArray(payload.questions) ? payload.questions : null

  if (!questionsPayload || questionsPayload.length === 0) {
    throw new ApiError('Survey questions response is invalid.', 500, 'INVALID_SURVEY_QUESTIONS', payload)
  }

  return questionsPayload.map(normalizeSurveyQuestion)
}

function normalizePreviewResult(payload: unknown): PreviewResult {
  if (!isRecord(payload)) {
    throw new ApiError('Preview response is invalid.', 500, 'INVALID_PREVIEW_FORMAT', payload)
  }
  if (typeof payload.diagnosedDate !== 'string') {
    throw new ApiError('diagnosedDate is invalid.', 500, 'INVALID_PREVIEW_DIAGNOSED_DATE', payload)
  }
  if (typeof payload.typeName !== 'string') {
    throw new ApiError('typeName is invalid.', 500, 'INVALID_PREVIEW_TYPE_NAME', payload)
  }
  if (typeof payload.subTitle !== 'string') {
    throw new ApiError('subTitle is invalid.', 500, 'INVALID_PREVIEW_SUBTITLE', payload)
  }
  if (typeof payload.summary !== 'string') {
    throw new ApiError('summary is invalid.', 500, 'INVALID_PREVIEW_SUMMARY', payload)
  }

  return {
    diagnosedDate: payload.diagnosedDate,
    typeName: payload.typeName,
    subTitle: payload.subTitle,
    summary: payload.summary,
  }
}

function normalizePreviewApiData(payload: unknown): PreviewApiData {
  if (!isRecord(payload)) {
    throw new ApiError('Preview API data is invalid.', 500, 'INVALID_PREVIEW_API_DATA', payload)
  }
  if (typeof payload.previewToken !== 'string') {
    throw new ApiError('previewToken is invalid.', 500, 'INVALID_PREVIEW_TOKEN', payload)
  }

  return {
    preview: normalizePreviewResult(payload.preview),
    previewToken: payload.previewToken,
  }
}

function normalizeIngredientMeta(raw: unknown, index: number): ResultIngredientMeta {
  if (!isRecord(raw)) {
    throw new ApiError(`Ingredient meta is invalid. (ingredientMetas[${index}])`, 500, 'INVALID_RESULT_INGREDIENT_META', raw)
  }

  if (typeof raw.name !== 'string') {
    throw new ApiError(`Ingredient meta name is invalid. (ingredientMetas[${index}])`, 500, 'INVALID_RESULT_INGREDIENT_NAME', raw)
  }

  if (typeof raw.description !== 'string') {
    throw new ApiError(
      `Ingredient meta description is invalid. (ingredientMetas[${index}])`,
      500,
      'INVALID_RESULT_INGREDIENT_DESCRIPTION',
      raw,
    )
  }

  return {
    name: raw.name,
    description: raw.description,
  }
}

function normalizeResultDetail(payload: unknown, fallbackResultId?: number): ResultDetail {
  if (!isRecord(payload)) {
    throw new ApiError('Result response is invalid.', 500, 'INVALID_RESULT_FORMAT', payload)
  }

  const resultId = toOptionalNumber(payload.resultId) ?? fallbackResultId
  if (resultId === undefined) {
    throw new ApiError('resultId is missing.', 500, 'INVALID_RESULT_ID', payload)
  }
  if (typeof payload.diagnosedAt !== 'string') {
    throw new ApiError('diagnosedAt is invalid.', 500, 'INVALID_RESULT_DIAGNOSED_AT', payload)
  }
  if (typeof payload.typeName !== 'string') {
    throw new ApiError('typeName is invalid.', 500, 'INVALID_RESULT_TYPE_NAME', payload)
  }
  if (typeof payload.subTitle !== 'string') {
    throw new ApiError('subTitle is invalid.', 500, 'INVALID_RESULT_SUBTITLE', payload)
  }
  if (typeof payload.summary !== 'string') {
    throw new ApiError('summary is invalid.', 500, 'INVALID_RESULT_SUMMARY', payload)
  }

  const concerns = Array.isArray(payload.concerns)
    ? payload.concerns.filter((item): item is string => typeof item === 'string')
    : []

  const ingredientMetas = Array.isArray(payload.ingredientMetas)
    ? payload.ingredientMetas.map((item, index) => normalizeIngredientMeta(item, index))
    : []

  return {
    resultId,
    diagnosedAt: payload.diagnosedAt,
    typeName: payload.typeName,
    subTitle: payload.subTitle,
    summary: payload.summary,
    concerns,
    subSummary: typeof payload.subSummary === 'string' ? payload.subSummary : '',
    ingredientMetas,
  }
}

function normalizeRoutineProduct(raw: unknown, slot: 'amRoutine' | 'pmRoutine', index: number): RoutineProduct {
  if (!isRecord(raw)) {
    throw new ApiError(`Routine product is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_FORMAT', raw)
  }

  if (typeof raw.productId !== 'number') {
    throw new ApiError(`Routine productId is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_ID', raw)
  }
  if (typeof raw.name !== 'string') {
    throw new ApiError(`Routine product name is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_NAME', raw)
  }
  if (typeof raw.brand !== 'string') {
    throw new ApiError(`Routine product brand is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_BRAND', raw)
  }
  if (!isProductCategory(raw.category)) {
    throw new ApiError(`Routine product category is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_CATEGORY', raw)
  }
  if (raw.imageUrl !== null && raw.imageUrl !== undefined && typeof raw.imageUrl !== 'string') {
    throw new ApiError(`Routine product imageUrl is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_IMAGE_URL', raw)
  }
  if (typeof raw.sortOrder !== 'number') {
    throw new ApiError(`Routine product sortOrder is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_SORT_ORDER', raw)
  }
  if (typeof raw.reason !== 'string') {
    throw new ApiError(`Routine product reason is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_REASON', raw)
  }
  if (typeof raw.note !== 'string') {
    throw new ApiError(`Routine product note is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_NOTE', raw)
  }

  return {
    productId: raw.productId,
    name: raw.name,
    brand: raw.brand,
    category: raw.category,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : null,
    sortOrder: raw.sortOrder,
    reason: raw.reason,
    note: raw.note,
    price: toOptionalNumber(raw.price),
  }
}

function normalizeRoutineDetail(raw: unknown, slot: 'amRoutine' | 'pmRoutine'): RoutineDetail {
  if (!isRecord(raw)) {
    throw new ApiError(`Routine detail is invalid. (${slot})`, 500, 'INVALID_ROUTINE_DETAIL_FORMAT', raw)
  }

  if (typeof raw.routineId !== 'number') {
    throw new ApiError(`Routine id is invalid. (${slot})`, 500, 'INVALID_ROUTINE_ID', raw)
  }
  if (typeof raw.routineType !== 'string') {
    throw new ApiError(`Routine type is invalid. (${slot})`, 500, 'INVALID_ROUTINE_TYPE', raw)
  }
  if (typeof raw.memo !== 'string') {
    throw new ApiError(`Routine memo is invalid. (${slot})`, 500, 'INVALID_ROUTINE_MEMO', raw)
  }
  if (!Array.isArray(raw.products)) {
    throw new ApiError(`Routine products are invalid. (${slot})`, 500, 'INVALID_ROUTINE_PRODUCTS', raw)
  }

  return {
    routineId: raw.routineId,
    routineType: raw.routineType,
    memo: raw.memo,
    products: raw.products.map((item, index) => normalizeRoutineProduct(item, slot, index)).sort((a, b) => a.sortOrder - b.sortOrder),
  }
}

function normalizeRoutineGroup(payload: unknown, fallbackResultId: number): RoutineGroup {
  if (!isRecord(payload)) {
    throw new ApiError('Routine group response is invalid.', 500, 'INVALID_ROUTINE_GROUP_FORMAT', payload)
  }

  const resultId = toOptionalNumber(payload.resultId) ?? toOptionalNumber(payload.skinResultId) ?? fallbackResultId
  if (!Number.isFinite(resultId)) {
    throw new ApiError('resultId is invalid.', 500, 'INVALID_ROUTINE_RESULT_ID', payload)
  }
  if (!isSkinTypeCode(payload.skinType)) {
    throw new ApiError('skinType is invalid.', 500, 'INVALID_SKIN_TYPE', payload)
  }
  if (typeof payload.title !== 'string') {
    throw new ApiError('Routine title is invalid.', 500, 'INVALID_ROUTINE_TITLE', payload)
  }
  if (typeof payload.summary !== 'string') {
    throw new ApiError('Routine summary is invalid.', 500, 'INVALID_ROUTINE_SUMMARY', payload)
  }
  if (typeof payload.caution !== 'string') {
    throw new ApiError('Routine caution is invalid.', 500, 'INVALID_ROUTINE_CAUTION', payload)
  }

  return {
    routineGroupId: toOptionalNumber(payload.routineGroupId) ?? fallbackResultId,
    resultId,
    skinType: payload.skinType,
    title: payload.title,
    summary: payload.summary,
    caution: payload.caution,
    amRoutine: normalizeRoutineDetail(payload.amRoutine, 'amRoutine'),
    pmRoutine: normalizeRoutineDetail(payload.pmRoutine, 'pmRoutine'),
    createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : '',
  }
}

function normalizeResultProductItem(raw: unknown, index: number) {
  if (!isRecord(raw)) {
    throw new ApiError(`Result product is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_FORMAT', raw)
  }

  if (typeof raw.productId !== 'number') {
    throw new ApiError(`Result productId is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_ID', raw)
  }
  if (typeof raw.name !== 'string') {
    throw new ApiError(`Result product name is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_NAME', raw)
  }
  if (typeof raw.brand !== 'string') {
    throw new ApiError(`Result product brand is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_BRAND', raw)
  }
  if (typeof raw.price !== 'number') {
    throw new ApiError(`Result product price is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_PRICE', raw)
  }
  if (raw.imageUrl !== null && raw.imageUrl !== undefined && typeof raw.imageUrl !== 'string') {
    throw new ApiError(`Result product imageUrl is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_IMAGE_URL', raw)
  }

  return {
    productId: raw.productId,
    name: raw.name,
    brand: raw.brand,
    price: raw.price,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : null,
  }
}

function normalizeResultProductsPage(payload: unknown): ResultProductsPageData {
  if (!isRecord(payload)) {
    throw new ApiError('Products page response is invalid.', 500, 'INVALID_PRODUCTS_PAGE_FORMAT', payload)
  }

  if (!Array.isArray(payload.products)) {
    throw new ApiError('Products list is invalid.', 500, 'INVALID_PRODUCTS_LIST', payload)
  }
  if (typeof payload.hasNext !== 'boolean') {
    throw new ApiError('Products hasNext is invalid.', 500, 'INVALID_PRODUCTS_HAS_NEXT', payload)
  }

  const tags = Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === 'string') : []

  return {
    tags,
    skinResultDate: typeof payload.skinResultDate === 'string' ? payload.skinResultDate : '',
    products: payload.products.map((item, index) => normalizeResultProductItem(item, index)),
    hasNext: payload.hasNext,
  }
}

function normalizeAuthUser(body: unknown): AuthUser {
  if (!isRecord(body)) {
    throw new ApiError('Auth user response is invalid.', 500, 'INVALID_AUTH_USER', body)
  }
  if (typeof body.userId !== 'number') {
    throw new ApiError('userId is invalid.', 500, 'INVALID_AUTH_USER_ID', body)
  }
  if (typeof body.nickname !== 'string') {
    throw new ApiError('nickname is invalid.', 500, 'INVALID_AUTH_NICKNAME', body)
  }
  if (typeof body.role !== 'string') {
    throw new ApiError('role is invalid.', 500, 'INVALID_AUTH_ROLE', body)
  }
  return {
    userId: body.userId,
    nickname: body.nickname,
    role: body.role,
    profileImageUrl: typeof body.profileImageUrl === 'string' ? body.profileImageUrl : null,
  }
}

// /me 응답은 envelope 또는 plain JSON 둘 다 수용합니다.
function unwrapMeResponse(body: unknown): AuthUser {
  if (isRecord(body) && typeof body.success === 'boolean') {
    return normalizeAuthUser(isRecord(body.data) ? body.data : body)
  }
  return normalizeAuthUser(body)
}

function normalizeRefreshResponse(body: unknown): { accessToken: string; refreshToken?: string } {
  if (isRecord(body) && typeof body.success === 'boolean') {
    body = isRecord(body.data) ? body.data : body
  }
  if (!isRecord(body) || typeof body.accessToken !== 'string') {
    throw new ApiError('Refresh response is invalid.', 500, 'INVALID_REFRESH_RESPONSE', body)
  }
  return {
    accessToken: body.accessToken,
    refreshToken: typeof body.refreshToken === 'string' ? body.refreshToken : undefined,
  }
}

export function createLiveApiClient(baseUrl: string): ApiClient {
  const requestWithAuth = createRequestWithAuth(baseUrl)

  return {
    async getSurveyQuestions() {
      const payload = await requestApi<unknown>(`${baseUrl}/surveys`, { method: 'GET' })
      return normalizeSurveyQuestions(payload)
    },

    async submitSurveyPreview(payload: SurveySubmitPayload) {
      const result = await requestApi<unknown>(`${baseUrl}/results/preview`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return normalizePreviewApiData(result)
    },

    async submitSurveyResult(input: SurveyResultInput, authState: AuthState) {
      const payload = await requestWithAuth<unknown>(
        `${baseUrl}/results`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
        authState.accessToken,
      )

      return normalizeResultDetail(payload)
    },

    async getResult(resultId: number, authState: AuthState): Promise<ResultDetail> {
      const payload = await requestWithAuth<unknown>(
        `${baseUrl}/results/${resultId}`,
        { method: 'GET' },
        authState.accessToken,
      )
      return normalizeResultDetail(payload, resultId)
    },

    async getRoutineGroup(resultId: number, authState: AuthState) {
      const payload = await requestWithAuth<unknown>(
        `${baseUrl}/results/${resultId}/routine`,
        { method: 'GET' },
        authState.accessToken,
      )

      return normalizeRoutineGroup(payload, resultId)
    },

    async getRecommendedProducts(query: ResultProductsQuery, authState: AuthState) {
      const params = new URLSearchParams({
        page: String(query.page),
      })

      query.categories?.forEach((category) => {
        params.append('category', category)
      })

      const payload = await requestWithAuth<unknown>(
        `${baseUrl}/results/${query.resultId}/products?${params.toString()}`,
        { method: 'GET' },
        authState.accessToken,
      )

      return normalizeResultProductsPage(payload)
    },

    async getProductDetail(productId: number) {
      return requestApi<ProductDetail>(`${baseUrl}/products/${productId}`, { method: 'GET' })
    },

    async getMe(accessToken: string): Promise<AuthUser> {
      const body = await requestApi<unknown>(`${baseUrl}/auth/me`, { method: 'GET' }, accessToken)
      return unwrapMeResponse(body)
    },

    async refreshAccessToken(refreshToken: string) {
      let response: Response
      const headers = new Headers({ 'Content-Type': 'application/json' })
      try {
        response = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ refreshToken }),
        })
      } catch (error) {
        throw new ApiError('네트워크 요청에 실패했습니다. API 연결 상태를 확인해 주세요.', 0, 'NETWORK_ERROR', error)
      }

      let body: unknown
      try {
        body = await readBody(response)
      } catch (error) {
        throw new ApiError('Response body could not be parsed.', response.status, 'INVALID_RESPONSE_BODY', error)
      }

      if (!response.ok) {
        throw toApiError(response.status, body)
      }

      return normalizeRefreshResponse(body)
    },

    async logout(accessToken: string): Promise<void> {
      await requestApi<null>(`${baseUrl}/auth/logout`, { method: 'POST' }, accessToken)
    },
  }
}
