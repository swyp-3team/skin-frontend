export interface ApiFieldError {
  field: string
  rejectedValue?: unknown
  reason: string
}

export interface ApiErrorPayload {
  code: string
  message: string
  fieldErrors?: ApiFieldError[]
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  error?: null
}

export interface ApiFailureResponse {
  success: false
  data?: null
  error: ApiErrorPayload
}
 
