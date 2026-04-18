import type { AuthState } from '../types/auth'
import { ApiError } from './errors'
import type { ApiClient } from './client'
import type { FullResult, PreviewResult, ProductDetail, SurveyQuestion, SurveySubmitPayload } from './types'

{/* 응답형식 확인하여 해당 형식으로 변환해주는 함수. json text null 으로 ...   */}
async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')
  if (!contentType) {
    return null
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}


/** * API 오류 응답을 ApiError 객체로 변환하는 함수
 * @param response - Fetch API의 Response 객체
 * @param body - 응답 본문에서 읽은 데이터 (이미 JSON으로 파싱된 경우)
 * @returns ApiError 객체
 */
function toApiError(response: Response, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    const code = 'code' in body && typeof body.code === 'string' ? body.code : undefined
    return new ApiError(body.message, response.status, code, body)
  }

  return new ApiError('요청 처리 중 오류가 발생했습니다.', response.status, undefined, body)
}






{/* 핵심함수 : JSON 응답을 요청 + 답변 받기 + 반환하는 함수 */}
async function requestJson<T>(url: string, init: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { ...init, headers })
  const body = await readBody(response)

  if (!response.ok) {
    throw toApiError(response, body)
  }

  if (body === null) {
    throw new ApiError('응답 본문이 비어 있습니다.', response.status)
  }

  return body as T
}






export function createLiveApiClient(baseUrl: string): ApiClient {
  return {
    /** getSurveyQuestions() : 
     * 설문 질문 요청함수 - GET {baseUrl}/surveys 
     * 기대하는 응답 - SurveyQuestion[] 
    (배열..  [
      { "questionId": 1, "title": "...", "options": [...] }
      ] 
      ? 확인할것)   
      */
    async getSurveyQuestions() {
      return requestJson<SurveyQuestion[]>(`${baseUrl}/surveys`, { method: 'GET' })
    },


    /** submitSurveyPreview() : 
     * 설문 미리보기 결과 요청함수 - POST {baseUrl}/results/preview
     * payload : SurveySubmitPayload (설문 답변 데이터)
     * 기대하는 응답 - PreviewResult
     */
    async submitSurveyPreview(payload: SurveySubmitPayload) {
      return requestJson<PreviewResult>(`${baseUrl}/results/preview`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    /** submitSurveyResult() :
     * 설문 전체 결과 요청함수 - POST {baseUrl}/results
     * payload : SurveySubmitPayload (설문 답변 데이터)
     * authState : AuthState (인증 상태, 액세스 토큰 포함)
     * 기대하는 응답 - FullResult
     */
    async submitSurveyResult(payload: SurveySubmitPayload, authState: AuthState) {
      return requestJson<FullResult>(
        `${baseUrl}/results`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        authState.accessToken
      )
    },


    /** getResult() :
     * 특정 결과 조회 함수 - GET {baseUrl}/results/{resultId}
     * resultId : number (결과 ID)
     * authState : AuthState (인증 상태, 액세스 토큰 포함)
     * 기대하는 응답 - FullResult
     */
    async getResult(resultId: number, authState: AuthState) {
      return requestJson<FullResult>(
        `${baseUrl}/results/${resultId}`,
        { method: 'GET' },
        authState.accessToken
      )
    },


    /** getProductDetail() :
     * 제품 상세 정보 요청함수 - GET {baseUrl}/products/{productId}
     * productId : number (제품 ID)
     * 기대하는 응답 - ProductDetail
     */
    async getProductDetail(productId: number) {
      return requestJson<ProductDetail>(`${baseUrl}/products/${productId}`, { method: 'GET' })
    },
  }
}
