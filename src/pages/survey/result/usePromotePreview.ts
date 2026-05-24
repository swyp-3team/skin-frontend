import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { createResultDetailPath } from '../../../app/routes'
import { apiClient } from '../../../api'
import { ApiError } from '../../../api/errors'
import type { ResultDetail } from '../../../api/types'
import { queryKeys } from '../../../lib/queryKeys'
import { useAuthStore } from '../../../stores/authStore'
import { useSurveyProgressStore } from '../../../stores/surveyProgressStore'
import { useSurveyResultStore } from '../../../stores/surveyResultStore'

export function usePromotePreview() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const previewToken = useSurveyProgressStore((state) => state.previewToken)
  const { clearPreviewResult } = useSurveyProgressStore(
    useShallow((state) => ({ clearPreviewResult: state.clearPreviewResult })),
  )
  const { setLatestResultId } = useSurveyResultStore(
    useShallow((state) => ({
      setLatestResultId: state.setLatestResultId,
    })),
  )

  return useMutation<ResultDetail, ApiError, void>({
    mutationFn: () => {
      if (!previewToken) {
        throw new ApiError('Preview token is missing.', 400, 'MISSING_PREVIEW_TOKEN')
      }

      const { user } = useAuthStore.getState()
      if (!user) {
        throw new ApiError('Authenticated session is missing.', 401, 'UNAUTHORIZED')
      }

      return apiClient.submitSurveyResult({ previewToken })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.result(result.resultId), result)
      clearPreviewResult()
      setLatestResultId(result.resultId)
      navigate(createResultDetailPath(result.resultId))
    },
  })
}
