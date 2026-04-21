import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { createResultDetailPath } from '../../../app/routes'
import { apiClient } from '../../../api'
import { ApiError } from '../../../api/errors'
import type { FullResult } from '../../../api/types'
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
  const { setLatestResultId, clearSavedRoutine } = useSurveyResultStore(
    useShallow((state) => ({
      setLatestResultId: state.setLatestResultId,
      clearSavedRoutine: state.clearSavedRoutine,
    })),
  )

  return useMutation<FullResult, ApiError, void>({
    mutationFn: () => {
      if (!previewToken) {
        throw new ApiError('Preview token is missing.', 400, 'MISSING_PREVIEW_TOKEN')
      }

      // loginMock은 동기적으로 Zustand 스토어를 업데이트하므로
      // getState()로 최신 토큰을 직접 읽어 stale closure 문제를 방지함
      const { accessToken } = useAuthStore.getState()
      if (!accessToken) {
        throw new ApiError('Access token is missing.', 401, 'UNAUTHORIZED')
      }

      return apiClient.submitSurveyResult({ previewToken }, { accessToken })
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.result(result.resultId), result)
      clearPreviewResult()
      setLatestResultId(result.resultId)
      clearSavedRoutine()
      navigate(createResultDetailPath(result.resultId))
    },
  })
}
