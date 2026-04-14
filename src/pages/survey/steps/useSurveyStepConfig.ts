import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../../api'
import { SURVEY_QUERY_KEYS } from '../../../constants/survey'
import type { SurveyStepConfig } from '../../../api/types'

interface UseSurveyStepConfigResult {
  stepConfig: SurveyStepConfig | undefined
  isLoading: boolean
  error: string | null
}

export function useSurveyStepConfig(): UseSurveyStepConfigResult {
  const { data, isPending, error } = useQuery({
    queryKey: SURVEY_QUERY_KEYS.stepConfig,
    queryFn: () => apiClient.getSurveyStepConfig(),
    staleTime: Infinity,
  })

  return {
    stepConfig: data,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
  }
}
