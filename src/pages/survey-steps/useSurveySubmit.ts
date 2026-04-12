import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { apiClient } from '../../api'
import type { FullResult, PreviewResult, SurveyAnswer, SurveySubmitPayload } from '../../api/types'
import { SURVEY_VALIDATION_MESSAGES } from '../../constants/survey'
import { SELECTION_TO_API_SKIN_TYPE } from '../../domain/surveyConfig'
import { useSurveyStore } from '../../stores/surveyStore'
import type { AuthState } from '../../types/auth'
import type { Concern, SkinTypeSelection } from '../../types/domain'

function buildPayload(
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
  const { answersByQuestionId, skinType, concerns, setLastResult } = useSurveyStore(
    useShallow((state) => ({
      answersByQuestionId: state.answersByQuestionId,
      skinType: state.skinType,
      concerns: state.concerns,
      setLastResult: state.setLastResult,
    }))
  )

  return useMutation<PreviewResult | FullResult, Error, AuthState>({
    mutationFn: async (authState) => {
      if (!skinType) {
        throw new Error(SURVEY_VALIDATION_MESSAGES.skinTypeRequiredBeforeSubmit)
      }

      const payload = buildPayload(answersByQuestionId, skinType, concerns)

      return authState.isAuthenticated
        ? apiClient.submitSurveyResult(payload, authState)
        : apiClient.submitSurveyPreview(payload)
    },
    onSuccess: (result) => {
      setLastResult(result)
    },
  })
}
