import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { apiClient } from '../../api'
import { ApiError } from '../../api/errors'
import type { SubmitOutcome, SurveyAnswer, SurveyQuestion, SurveySubmitPayload } from '../../api/types'
import { SURVEY_QUERY_KEYS } from '../../constants/survey'
import { CONCERN_STEP, SKIN_TYPE_STEP, isConcernCode, isSkinTypeCode } from '../../domain/surveyCodes'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../stores/authStore'
import { useSurveyProgressStore } from '../../stores/surveyProgressStore'
import type { SurveyAnswersByStep, SurveyStepAnswer } from '../../stores/surveyProgressStore'
import { useSurveyResultStore } from '../../stores/surveyResultStore'

interface BuildSurveySubmitPayloadInput {
  answersByStep: SurveyAnswersByStep
  questions: SurveyQuestion[]
}

const MAX_CONCERN_SELECTIONS = 2

function buildAnswers(answersByStep: SurveyAnswersByStep): SurveyAnswer[] {
  return Object.entries(answersByStep)
    .filter(([step]) => {
      const id = Number(step)
      return id !== SKIN_TYPE_STEP && id !== CONCERN_STEP
    })
    .flatMap(([step, value]) => {
      if (typeof value !== 'number') {
        return []
      }
      return [{ step: Number(step), answer: value }]
    })
    .sort((a, b) => a.step - b.step)
}

function getSelectedCode(questions: SurveyQuestion[], step: number, optionNumber: number) {
  const surveyStep = questions.find((item) => item.step === step)
  if (!surveyStep) {
    throw new ApiError(`Survey step not found. (step: ${step})`, 400, 'INVALID_SURVEY_STEP')
  }

  const option = surveyStep.options.find((item) => item.optionNumber === optionNumber)
  if (!option) {
    throw new ApiError(`Survey option not found. (step: ${step}, optionNumber: ${optionNumber})`, 400, 'INVALID_SURVEY_OPTION')
  }

  return option.code
}

function toSingleOptionNumber(value: SurveyStepAnswer | undefined, errorCode: string, message: string) {
  if (typeof value === 'number') {
    return value
  }

  throw new ApiError(message, 400, errorCode)
}

function toConcernOptionNumbers(value: SurveyStepAnswer | undefined) {
  if (typeof value === 'number') {
    return [value]
  }

  if (!Array.isArray(value)) {
    throw new ApiError('Concern answer is missing.', 400, 'MISSING_CONCERN_ANSWER')
  }

  const uniqueOptionNumbers = [...new Set(value.filter((item) => Number.isInteger(item) && item > 0))]
  if (uniqueOptionNumbers.length === 0) {
    throw new ApiError('Concern answer is missing.', 400, 'MISSING_CONCERN_ANSWER')
  }

  if (uniqueOptionNumbers.length > MAX_CONCERN_SELECTIONS) {
    throw new ApiError('Concern answer count exceeds limit.', 400, 'INVALID_CONCERN_SELECTION_COUNT')
  }

  return uniqueOptionNumbers
}

function getRequiredSkinType(questions: SurveyQuestion[], answersByStep: SurveyAnswersByStep) {
  const optionNumber = toSingleOptionNumber(
    answersByStep[SKIN_TYPE_STEP],
    'MISSING_SKIN_TYPE_ANSWER',
    'Skin type answer is missing.',
  )

  const code = getSelectedCode(questions, SKIN_TYPE_STEP, optionNumber)
  if (!isSkinTypeCode(code)) {
    throw new ApiError('Skin type code is invalid.', 400, 'INVALID_SKIN_TYPE_CODE')
  }

  return code
}

function getRequiredConcerns(questions: SurveyQuestion[], answersByStep: SurveyAnswersByStep) {
  return toConcernOptionNumbers(answersByStep[CONCERN_STEP]).map((optionNumber) => {
    const code = getSelectedCode(questions, CONCERN_STEP, optionNumber)
    if (!isConcernCode(code)) {
      throw new ApiError('Concern code is invalid.', 400, 'INVALID_CONCERN_CODE')
    }
    return code
  })
}

function buildSurveySubmitPayload({ answersByStep, questions }: BuildSurveySubmitPayloadInput): SurveySubmitPayload {
  const answers = buildAnswers(answersByStep)
  const skinType = getRequiredSkinType(questions, answersByStep)
  const concerns = getRequiredConcerns(questions, answersByStep)

  return {
    answers,
    skinType,
    concerns,
  }
}

export function useSurveySubmit() {
  const queryClient = useQueryClient()
  const { answersByStep, setPreviewResult, setPreviewToken, clearPreviewResult, clearProgress } = useSurveyProgressStore(
    useShallow((state) => ({
      answersByStep: state.answersByStep,
      setPreviewResult: state.setPreviewResult,
      setPreviewToken: state.setPreviewToken,
      clearPreviewResult: state.clearPreviewResult,
      clearProgress: state.clearProgress,
    })),
  )
  const { setLatestResultId } = useSurveyResultStore(
    useShallow((state) => ({
      setLatestResultId: state.setLatestResultId,
    })),
  )

  return useMutation<SubmitOutcome, ApiError, void>({
    mutationFn: async () => {
      const questions = await queryClient.ensureQueryData({
        queryKey: SURVEY_QUERY_KEYS.questions,
        queryFn: () => apiClient.getSurveyQuestions(),
        staleTime: Infinity,
      })

      const payload = buildSurveySubmitPayload({ answersByStep, questions })

      const { user } = useAuthStore.getState()
      if (user) {
        const result = await apiClient.submitSurveyResult(payload)
        return { kind: 'full', result }
      }

      const { preview, previewToken } = await apiClient.submitSurveyPreview(payload)
      return { kind: 'preview', result: preview, previewToken }
    },
    onSuccess: (outcome) => {
      if (outcome.kind === 'preview') {
        setPreviewResult(outcome.result)
        setPreviewToken(outcome.previewToken)
        clearProgress()
      } else {
        clearProgress()
        queryClient.setQueryData(queryKeys.result(outcome.result.resultId), outcome.result)
        clearPreviewResult()
        setLatestResultId(outcome.result.resultId)
      }
    },
  })
}
