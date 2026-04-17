import type { AuthState } from '../types/auth'
import { ApiError } from './errors'
import type { ApiClient } from './client'
import type { FullResult, PreviewResult, ProductDetail, SurveyQuestion, SurveySubmitPayload } from './types'

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

function toApiError(response: Response, body: unknown): ApiError {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    const code = 'code' in body && typeof body.code === 'string' ? body.code : undefined
    return new ApiError(body.message, response.status, code, body)
  }

  return new ApiError('요청 처리 중 오류가 발생했습니다.', response.status, undefined, body)
}

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
    async getSurveyQuestions() {
      return requestJson<SurveyQuestion[]>(`${baseUrl}/surveys`, { method: 'GET' })
    },

    async submitSurveyPreview(payload: SurveySubmitPayload) {
      return requestJson<PreviewResult>(`${baseUrl}/results/preview`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

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

    async getResult(resultId: number, authState: AuthState) {
      return requestJson<FullResult>(
        `${baseUrl}/results/${resultId}`,
        { method: 'GET' },
        authState.accessToken
      )
    },

    async getProductDetail(productId: number) {
      return requestJson<ProductDetail>(`${baseUrl}/products/${productId}`, { method: 'GET' })
    },
  }
}
