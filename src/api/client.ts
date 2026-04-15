import type { AuthState } from '../types/auth'
import type { FullResult, PreviewResult, SurveyQuestion, SurveySubmitPayload } from './types'

export interface ApiClient {
  getSurveyQuestions(): Promise<SurveyQuestion[]>
  submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewResult>
  submitSurveyResult(payload: SurveySubmitPayload, authState: AuthState): Promise<FullResult>
  getResult(resultId: number, authState: AuthState): Promise<FullResult>
}
