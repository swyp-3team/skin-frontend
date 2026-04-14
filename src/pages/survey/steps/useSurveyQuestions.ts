import { useQueries } from '@tanstack/react-query'

import { apiClient } from '../../../api'
import type { SurveyQuestion } from '../../../api/types'
import { SURVEY_QUESTION_STEP_COUNT, SURVEY_QUERY_KEYS, SURVEY_STATUS_MESSAGES } from '../../../constants/survey'

interface UseSurveyQuestionsResult {
  questions: SurveyQuestion[]
  isLoadingQuestions: boolean
  questionLoadError: string | null
}

export function useSurveyQuestions(): UseSurveyQuestionsResult {
  const results = useQueries({
    queries: Array.from({ length: SURVEY_QUESTION_STEP_COUNT }, (_, i) => ({
      queryKey: SURVEY_QUERY_KEYS.questions(i + 1),
      queryFn: () => apiClient.getSurveyQuestions(i + 1),
      staleTime: Infinity,
    })),
  })

  const questions = results.flatMap((r) => r.data ?? [])
  const isLoadingQuestions = results.some((r) => r.isPending)
  const failedResult = results.find((r) => r.error)
  const questionLoadError = failedResult
    ? failedResult.error instanceof Error
      ? failedResult.error.message
      : SURVEY_STATUS_MESSAGES.loadQuestionsFailed
    : null

  return {
    questions,
    isLoadingQuestions,
    questionLoadError,
  }
}
