import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../api'
import type { SurveyQuestion } from '../../api/types'

interface UseSurveyQuestionsResult {
  questions: SurveyQuestion[]
  isLoadingQuestions: boolean
  questionLoadError: string | null
}

export function useSurveyQuestions(): UseSurveyQuestionsResult {
  const { data, isPending, error } = useQuery({
    queryKey: ['surveyQuestions'],
    queryFn: () => apiClient.getSurveyQuestions(),
    staleTime: Infinity,
  })

  const questionLoadError = error
    ? error instanceof Error
      ? error.message
      : '설문 문항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
    : null

  return {
    questions: data ?? [],
    isLoadingQuestions: isPending,
    questionLoadError,
  }
}
