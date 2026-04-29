export const SURVEY_INTRO_ENTRY_POINTS = {
  routine: 'routine',
  products: 'products',
} as const

export type SurveyIntroEntryPoint = (typeof SURVEY_INTRO_ENTRY_POINTS)[keyof typeof SURVEY_INTRO_ENTRY_POINTS]

export interface SurveyIntroEntryState {
  surveyEntryPoint: SurveyIntroEntryPoint
}

export function isSurveyIntroEntryState(value: unknown): value is SurveyIntroEntryState {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (!('surveyEntryPoint' in value)) {
    return false
  }

  const entryPoint = (value as { surveyEntryPoint?: unknown }).surveyEntryPoint
  return entryPoint === SURVEY_INTRO_ENTRY_POINTS.routine || entryPoint === SURVEY_INTRO_ENTRY_POINTS.products
}
