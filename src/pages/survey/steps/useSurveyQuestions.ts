import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../../api'
import type { SurveyQuestion } from '../../../api/types'
import { SURVEY_QUERY_KEYS, SURVEY_STATUS_MESSAGES } from '../../../constants/survey'

interface UseSurveyQuestionsResult {
  questions: SurveyQuestion[]
  isLoading: boolean
  error: string | null
}

export function useSurveyQuestions(): UseSurveyQuestionsResult {
  const { data, isPending, error } = useQuery({
    queryKey: SURVEY_QUERY_KEYS.questions,
    queryFn: () => apiClient.getSurveyQuestions(),
    staleTime: Infinity,
  })

  return {
    questions: data ?? [],
    isLoading: isPending,
    error: error instanceof Error ? error.message : error ? SURVEY_STATUS_MESSAGES.loadQuestionsFailed : null,
  }
}
