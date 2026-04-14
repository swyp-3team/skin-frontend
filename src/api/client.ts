import type { AuthState } from '../types/auth'
import type { FullResult, PreviewResult, SurveyQuestion, SurveyResultPayload, SurveyStepConfig, SurveySubmitPayload } from './types'

export interface ApiClient {
  getSurveyQuestions(step: number): Promise<SurveyQuestion[]>
  getSurveyStepConfig(): Promise<SurveyStepConfig>
  submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewResult>
  submitSurveyResult(payload: SurveyResultPayload, authState: AuthState): Promise<FullResult>
  getResult(resultId: number, authState: AuthState): Promise<FullResult>
}
