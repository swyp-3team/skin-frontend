import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { apiClient } from '../../api'
import type { SubmitOutcome, SurveyAnswer, SurveySubmitPayload } from '../../api/types'
import { SURVEY_VALIDATION_MESSAGES } from '../../constants/survey'
import { SELECTION_TO_API_SKIN_TYPE } from '../../domain/surveyConfig'
import { queryKeys } from '../../lib/queryKeys'
import { useSurveyStore } from '../../stores/surveyStore'
import type { AuthState } from '../../types/auth'
import type { Concern, SkinTypeSelection } from '../../types/domain'

function buildPayload(
  /** Zustand에서 관리하는 설문 상태를 API 요청에 맞는 형태로 변환하는 헬퍼 함수
   store에서 답변을 가져와서 API 형태로 변환 **/
  answersByQuestionId: Record<number, number>,
  skinType: SkinTypeSelection,
  concerns: Concern[],
): SurveySubmitPayload {
  const answers: SurveyAnswer[] = Object.entries(answersByQuestionId)
    .map(([questionId, value]) => ({ questionId: Number(questionId), value }))
    .sort((a, b) => a.questionId - b.questionId)

  return {
    answers,
    skinType: SELECTION_TO_API_SKIN_TYPE[skinType],
    concerns,
  }
}

export function useSurveySubmit() {
  const queryClient = useQueryClient()
  const { answersByQuestionId, skinType, concerns, setLatestResultId, clearSavedRoutine } = useSurveyStore(
    useShallow((state) => ({
      answersByQuestionId: state.answersByQuestionId,
      skinType: state.skinType,
      concerns: state.concerns,
      setLatestResultId: state.setLatestResultId,
      clearSavedRoutine: state.clearSavedRoutine,
    })),
  )

  return useMutation<SubmitOutcome, Error, AuthState>({
    mutationFn: async (authState) => {
      if (!skinType) {
        throw new Error(SURVEY_VALIDATION_MESSAGES.skinTypeRequiredBeforeSubmit)
      }

      const payload = buildPayload(answersByQuestionId, skinType, concerns)

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
        queryClient.setQueryData(queryKeys.surveyPreview(), outcome.result)
      } else {
        queryClient.setQueryData(queryKeys.result(outcome.result.resultId), outcome.result)
        queryClient.removeQueries({ queryKey: queryKeys.surveyPreview() })
        setLatestResultId(outcome.result.resultId)
        clearSavedRoutine()
      }
    },
  })
}
