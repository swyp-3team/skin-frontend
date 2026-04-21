import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../../api'
import { ApiError } from '../../../api/errors'
import type { SurveyQuestion } from '../../../api/types'
import { SURVEY_QUERY_KEYS } from '../../../constants/survey'

interface UseSurveyQuestionsResult {
  questions: SurveyQuestion[]
  isLoading: boolean
  error: string | null
}

export function useSurveyQuestions(): UseSurveyQuestionsResult {
  const { data, isPending, error } = useQuery<SurveyQuestion[], ApiError>({
    queryKey: SURVEY_QUERY_KEYS.questions,
    queryFn: () => apiClient.getSurveyQuestions(),
    staleTime: Infinity,
  })

  return {
    questions: data ?? [],
    isLoading: isPending,
    error: error ? error.message : null,
  }
}
