import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { apiClient } from '../../api'
import type { SubmitOutcome, SurveyAnswer, SurveySubmitPayload } from '../../api/types'
import { queryKeys } from '../../lib/queryKeys'
import { useSurveyStore } from '../../stores/surveyStore'
import type { AuthState } from '../../types/auth'

function buildPayload(answersByQuestionId: Record<number, number>): SurveySubmitPayload {
  const answers: SurveyAnswer[] = Object.entries(answersByQuestionId)
    .map(([questionId, value]) => ({ questionId: Number(questionId), value }))
    .sort((a, b) => a.questionId - b.questionId)

  return { answers }
}

export function useSurveySubmit() {
  const queryClient = useQueryClient()
  const { answersByQuestionId, setPreviewResult, clearPreviewResult, setLatestResultId, clearSavedRoutine } =
    useSurveyStore(
      useShallow((state) => ({
        answersByQuestionId: state.answersByQuestionId,
        setPreviewResult: state.setPreviewResult,
        clearPreviewResult: state.clearPreviewResult,
        setLatestResultId: state.setLatestResultId,
        clearSavedRoutine: state.clearSavedRoutine,
      })),
    )

  return useMutation<SubmitOutcome, Error, AuthState>({
    mutationFn: async (authState) => {
      const payload = buildPayload(answersByQuestionId)

      if (authState.accessToken) {
        const result = await apiClient.submitSurveyResult(payload, authState)
        return { kind: 'full', result }
      } else {
        const result = await apiClient.submitSurveyPreview(payload)
        return { kind: 'preview', result }
      }
    },
    onSuccess: (outcome) => {
      if (outcome.kind === 'preview') {
        setPreviewResult(outcome.result)
      } else {
        queryClient.setQueryData(queryKeys.result(outcome.result.resultId), outcome.result)
        clearPreviewResult()
        setLatestResultId(outcome.result.resultId)
        clearSavedRoutine()
      }
    },
  })
}
