import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import type { SurveyQuestion } from '../../api/types'
import { SURVEY_QUERY_KEYS, SURVEY_STATUS_MESSAGES } from '../../constants/survey'

interface UseSurveyQuestionsResult {
  questions: SurveyQuestion[]
  isLoadingQuestions: boolean
  questionLoadError: string | null
}

export function useSurveyQuestions(): UseSurveyQuestionsResult {
  const { data, isPending, error } = useQuery({
    queryKey: SURVEY_QUERY_KEYS.questions,
    queryFn: () => apiClient.getSurveyQuestions(),
    staleTime: Infinity,
  })

  const questionLoadError = error
    ? error instanceof Error
      ? error.message
      : SURVEY_STATUS_MESSAGES.loadQuestionsFailed
    : null

  return {
    questions: data ?? [],
    isLoadingQuestions: isPending,
    questionLoadError,
  }
}
