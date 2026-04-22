import { isConcernCode, isSkinTypeCode } from '../domain/surveyCodes'
import type { ProductCategory } from '../types/domain'
import type { AuthState } from '../types/auth'
import type { ApiClient } from './client'
import type { ApiErrorPayload, ApiFieldError } from './contracts'
import { ApiError } from './errors'
import type {
  FullResult,
  PreviewApiData,
  ProductDetail,
  ResultDetail,
  ResultProductsPageData,
  ResultProductsQuery,
  ResultSummary,
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
  if (isRecord(body) && typeof body.success === 'boolean') {
    if (!body.success) {
      throw toApiError(status, body)
    }

    if (!('data' in body)) {
      throw new ApiError('Response data is missing.', status, 'MISSING_RESPONSE_DATA', body)
    }

    return body.data as T
  }

  return body as T
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

  const optionNumberCandidate = raw.optionNumber
  const contentCandidate = raw.content
  const optionNumber = normalizeOptionNumber(optionNumberCandidate, step, optionIndex, raw)

  if (typeof contentCandidate !== 'string') {
    throw new ApiError(
      `Survey option label is invalid. (step: ${step}, index: ${optionIndex})`,
      500,
      'INVALID_SURVEY_OPTION_LABEL',
      raw,
    )
  }

  return {
    optionNumber,
    content: contentCandidate,
    code: normalizeOptionCode(raw.code),
  } satisfies SurveyQuestion['options'][number]
}

function normalizeSurveyQuestion(raw: unknown, questionIndex: number): SurveyQuestion {
  if (!isRecord(raw)) {
    throw new ApiError(`Survey question format is invalid. (index: ${questionIndex})`, 500, 'INVALID_SURVEY_QUESTION_FORMAT')
  }

  const stepCandidate = raw.step
  const questionCandidate = raw.question
  const optionsCandidate = raw.options

  if (typeof stepCandidate !== 'number') {
    throw new ApiError(`Survey step is invalid. (index: ${questionIndex})`, 500, 'INVALID_SURVEY_STEP', raw)
  }

  if (typeof questionCandidate !== 'string') {
    throw new ApiError(`Survey question text is invalid. (step: ${stepCandidate})`, 500, 'INVALID_SURVEY_TEXT', raw)
  }

  if (!Array.isArray(optionsCandidate)) {
    throw new ApiError(`Survey options are invalid. (step: ${stepCandidate})`, 500, 'INVALID_SURVEY_OPTIONS', raw)
  }

  return {
    step: stepCandidate,
    question: questionCandidate,
    options: optionsCandidate.map((option, optionIndex) => normalizeSurveyOption(option, stepCandidate, optionIndex)),
  }
}

function normalizeSurveyQuestions(payload: unknown): SurveyQuestion[] {
  const questionsPayload = isRecord(payload) && Array.isArray(payload.questions) ? payload.questions : null

  if (!questionsPayload || questionsPayload.length === 0) {
    throw new ApiError('Survey questions response is invalid.', 500, 'INVALID_SURVEY_QUESTIONS', payload)
  }

  return questionsPayload.map(normalizeSurveyQuestion)
}

function normalizeRoutineProduct(raw: unknown, slot: 'amRoutine' | 'pmRoutine', index: number): RoutineProduct {
  if (!isRecord(raw)) {
    throw new ApiError(`Routine product is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_FORMAT', raw)
  }

  const { productId, name, brand, category, imageUrl, sortOrder, reason, note } = raw

  if (typeof productId !== 'number') {
    throw new ApiError(`Routine productId is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_ID', raw)
  }
  if (typeof name !== 'string') {
    throw new ApiError(`Routine product name is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_NAME', raw)
  }
  if (typeof brand !== 'string') {
    throw new ApiError(`Routine product brand is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_BRAND', raw)
  }
  if (!isProductCategory(category)) {
    throw new ApiError(`Routine product category is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_CATEGORY', raw)
  }
  if (imageUrl !== null && typeof imageUrl !== 'string') {
    throw new ApiError(`Routine product imageUrl is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_IMAGE_URL', raw)
  }
  if (typeof sortOrder !== 'number') {
    throw new ApiError(`Routine product sortOrder is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_SORT_ORDER', raw)
  }
  if (typeof reason !== 'string') {
    throw new ApiError(`Routine product reason is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_REASON', raw)
  }
  if (typeof note !== 'string') {
    throw new ApiError(`Routine product note is invalid. (${slot}[${index}])`, 500, 'INVALID_ROUTINE_PRODUCT_NOTE', raw)
  }

  return {
    productId,
    name,
    brand,
    category,
    imageUrl,
    sortOrder,
    reason,
    note,
  }
}

function normalizeRoutineDetail(raw: unknown, slot: 'amRoutine' | 'pmRoutine'): RoutineDetail {
  if (!isRecord(raw)) {
    throw new ApiError(`Routine detail is invalid. (${slot})`, 500, 'INVALID_ROUTINE_DETAIL_FORMAT', raw)
  }

  const { routineId, routineType, memo, products } = raw

  if (typeof routineId !== 'number') {
    throw new ApiError(`Routine id is invalid. (${slot})`, 500, 'INVALID_ROUTINE_ID', raw)
  }
  if (typeof routineType !== 'string') {
    throw new ApiError(`Routine type is invalid. (${slot})`, 500, 'INVALID_ROUTINE_TYPE', raw)
  }
  if (typeof memo !== 'string') {
    throw new ApiError(`Routine memo is invalid. (${slot})`, 500, 'INVALID_ROUTINE_MEMO', raw)
  }
  if (!Array.isArray(products)) {
    throw new ApiError(`Routine products are invalid. (${slot})`, 500, 'INVALID_ROUTINE_PRODUCTS', raw)
  }

  const normalizedProducts = products
    .map((item, index) => normalizeRoutineProduct(item, slot, index))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    routineId,
    routineType,
    memo,
    products: normalizedProducts,
  }
}

function normalizeResultSummary(payload: unknown): ResultSummary {
  const raw = Array.isArray(payload) ? payload[0] : undefined
  if (!isRecord(raw)) {
    throw new ApiError('resultSummary is missing or invalid.', 500, 'INVALID_RESULT_SUMMARY', payload)
  }

  const { resultId, title, badge, summaryShort, createdAt } = raw

  if (typeof resultId !== 'string') {
    throw new ApiError('resultSummary.resultId is invalid.', 500, 'INVALID_RESULT_SUMMARY_ID', raw)
  }
  if (typeof title !== 'string') {
    throw new ApiError('resultSummary.title is invalid.', 500, 'INVALID_RESULT_SUMMARY_TITLE', raw)
  }
  if (typeof summaryShort !== 'string') {
    throw new ApiError('resultSummary.summaryShort is invalid.', 500, 'INVALID_RESULT_SUMMARY_SHORT', raw)
  }
  if (typeof createdAt !== 'string') {
    throw new ApiError('resultSummary.createdAt is invalid.', 500, 'INVALID_RESULT_SUMMARY_CREATED_AT', raw)
  }
  if (!isRecord(badge) || typeof badge.label !== 'string' || typeof badge.type !== 'string') {
    throw new ApiError('resultSummary.badge is invalid.', 500, 'INVALID_RESULT_SUMMARY_BADGE', raw)
  }

  return {
    resultId,
    title,
    badge: { label: badge.label, type: badge.type },
    summaryShort,
    createdAt,
  }
}

function normalizeRoutineGroup(payload: unknown): RoutineGroup {
  if (!isRecord(payload)) {
    throw new ApiError('Routine group response is invalid.', 500, 'INVALID_ROUTINE_GROUP_FORMAT', payload)
  }

  const { routineGroupId, title, skinResultId, skinType, summary, caution, amRoutine, pmRoutine, createdAt } = payload

  if (typeof routineGroupId !== 'number') {
    throw new ApiError('routineGroupId is invalid.', 500, 'INVALID_ROUTINE_GROUP_ID', payload)
  }
  if (typeof title !== 'string') {
    throw new ApiError('Routine title is invalid.', 500, 'INVALID_ROUTINE_TITLE', payload)
  }
  if (typeof skinResultId !== 'number') {
    throw new ApiError('skinResultId is invalid.', 500, 'INVALID_SKIN_RESULT_ID', payload)
  }
  if (!isSkinTypeCode(skinType)) {
    throw new ApiError('skinType is invalid.', 500, 'INVALID_SKIN_TYPE', payload)
  }
  if (typeof summary !== 'string') {
    throw new ApiError('Routine summary is invalid.', 500, 'INVALID_ROUTINE_SUMMARY', payload)
  }
  if (typeof caution !== 'string') {
    throw new ApiError('Routine caution is invalid.', 500, 'INVALID_ROUTINE_CAUTION', payload)
  }
  if (typeof createdAt !== 'string') {
    throw new ApiError('Routine createdAt is invalid.', 500, 'INVALID_ROUTINE_CREATED_AT', payload)
  }

  return {
    routineGroupId,
    title,
    skinResultId,
    skinType,
    summary,
    caution,
    amRoutine: normalizeRoutineDetail(amRoutine, 'amRoutine'),
    pmRoutine: normalizeRoutineDetail(pmRoutine, 'pmRoutine'),
    createdAt,
  }
}

function normalizeResultProductItem(raw: unknown, index: number) {
  if (!isRecord(raw)) {
    throw new ApiError(`Result product is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_FORMAT', raw)
  }

  const { productId, name, brand, category, price, imageUrl } = raw

  if (typeof productId !== 'number') {
    throw new ApiError(`Result productId is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_ID', raw)
  }
  if (typeof name !== 'string') {
    throw new ApiError(`Result product name is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_NAME', raw)
  }
  if (typeof brand !== 'string') {
    throw new ApiError(`Result product brand is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_BRAND', raw)
  }
  if (!isProductCategory(category)) {
    throw new ApiError(`Result product category is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_CATEGORY', raw)
  }
  if (typeof price !== 'number') {
    throw new ApiError(`Result product price is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_PRICE', raw)
  }
  if (imageUrl !== null && typeof imageUrl !== 'string') {
    throw new ApiError(`Result product imageUrl is invalid. (products[${index}])`, 500, 'INVALID_RESULT_PRODUCT_IMAGE_URL', raw)
  }

  return {
    productId,
    name,
    brand,
    category,
    price,
    imageUrl,
  }
}

function normalizeResultProductsPage(payload: unknown): ResultProductsPageData {
  if (!isRecord(payload)) {
    throw new ApiError('Products page response is invalid.', 500, 'INVALID_PRODUCTS_PAGE_FORMAT', payload)
  }

  const { tags, skinResultDate, products, hasNext } = payload

  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
    throw new ApiError('Products tags are invalid.', 500, 'INVALID_PRODUCTS_TAGS', payload)
  }
  if (typeof skinResultDate !== 'string') {
    throw new ApiError('skinResultDate is invalid.', 500, 'INVALID_SKIN_RESULT_DATE', payload)
  }
  if (!Array.isArray(products)) {
    throw new ApiError('Products list is invalid.', 500, 'INVALID_PRODUCTS_LIST', payload)
  }
  if (typeof hasNext !== 'boolean') {
    throw new ApiError('Products hasNext is invalid.', 500, 'INVALID_PRODUCTS_HAS_NEXT', payload)
  }

  return {
    tags,
    skinResultDate,
    products: products.map((item, index) => normalizeResultProductItem(item, index)),
    hasNext,
  }
}

export function createLiveApiClient(baseUrl: string): ApiClient {
  return {
    async getSurveyQuestions() {
      const payload = await requestApi<unknown>(`${baseUrl}/surveys`, { method: 'GET' })
      return normalizeSurveyQuestions(payload)
    },

    async submitSurveyPreview(payload: SurveySubmitPayload) {
      return requestApi<PreviewApiData>(`${baseUrl}/results/preview`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async submitSurveyResult(input: SurveyResultInput, authState: AuthState) {
      return requestApi<FullResult>(
        `${baseUrl}/results`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
        authState.accessToken,
      )
    },

    async getResult(resultId: number, authState: AuthState): Promise<ResultDetail> {
      const payload = await requestApi<unknown>(`${baseUrl}/results/${resultId}`, { method: 'GET' }, authState.accessToken)
      if (!isRecord(payload)) {
        throw new ApiError('Result response is invalid.', 500, 'INVALID_RESULT_FORMAT', payload)
      }
      const resultSummary = normalizeResultSummary(payload.resultSummary)
      return { ...(payload as unknown as FullResult), resultSummary }
    },

    async getRoutineGroup(skinResultId: number, authState: AuthState) {
      const payload = await requestApi<unknown>(`${baseUrl}/routines/${skinResultId}`, { method: 'GET' }, authState.accessToken)
      return normalizeRoutineGroup(payload)
    },

    async getRecommendedProducts(query: ResultProductsQuery, authState: AuthState) {
      const params = new URLSearchParams({
        skinResultId: String(query.skinResultId),
        page: String(query.page),
      })
      const payload = await requestApi<unknown>(`${baseUrl}/products/recommend?${params.toString()}`, { method: 'GET' }, authState.accessToken)
      return normalizeResultProductsPage(payload)
    },

    async getProductDetail(productId: number) {
      return requestApi<ProductDetail>(`${baseUrl}/products/${productId}`, { method: 'GET' })
    },
  }
}
