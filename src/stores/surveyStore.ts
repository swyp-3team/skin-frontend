import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { apiClient } from '../api'
import { normalizeApiError } from '../api/errors'
import type { FullResult, PreviewResult, SurveyAnswer, SurveySubmitPayload } from '../api/types'
import { SELECTION_TO_API_SKIN_TYPE, SKIN_TYPE_OPTIONS, VALID_CONCERNS } from '../domain/surveyConfig'
import type { AuthState } from '../types/auth'
import type { Concern, SkinTypeSelection } from '../types/domain'

export const LEGACY_SKIN_TYPE_KEY = 'survey.selectedSkinType'
const SESSION_STORAGE_KEY = 'survey.session'

const validSkinTypeSelections: readonly SkinTypeSelection[] = SKIN_TYPE_OPTIONS.map((option) => option.value)

function isSkinTypeSelection(value: string): value is SkinTypeSelection {
  return validSkinTypeSelections.includes(value as SkinTypeSelection)
}

function readLegacySkinType(): SkinTypeSelection | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(LEGACY_SKIN_TYPE_KEY)
  if (!value) {
    return null
  }

  const lowerCased = value.toLowerCase()
  return isSkinTypeSelection(lowerCased) ? lowerCased : null
}

function syncLegacySkinType(value: SkinTypeSelection | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (value === null) {
    window.localStorage.removeItem(LEGACY_SKIN_TYPE_KEY)
    return
  }

  window.localStorage.setItem(LEGACY_SKIN_TYPE_KEY, value)
}

function toSubmitPayload(state: SurveyStoreState): SurveySubmitPayload {
  if (!state.skinType) {
    throw new Error('피부 타입을 먼저 선택해주세요.')
  }

  const answers: SurveyAnswer[] = Object.entries(state.answersByQuestionId)
    .map(([questionId, value]) => ({
      questionId: Number(questionId),
      value,
    }))
    .sort((a, b) => a.questionId - b.questionId)

  return {
    answers,
    skinType: SELECTION_TO_API_SKIN_TYPE[state.skinType],
    concerns: state.concerns,
  }
}

export interface SurveyStoreState {
  currentStep: number
  answersByQuestionId: Record<number, number>
  skinType: SkinTypeSelection | null
  concerns: Concern[]
  isSubmitting: boolean
  submitError: string | null
  lastResult: PreviewResult | FullResult | null
}

export interface SurveyStoreActions {
  setAnswer: (questionId: number, value: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setSkinType: (value: SkinTypeSelection) => void
  toggleConcern: (value: Concern) => void
  submitSurvey: (authState: AuthState) => Promise<PreviewResult | FullResult>
  resetSurvey: () => void
  clearSubmitError: () => void
}

type SurveyStore = SurveyStoreState & SurveyStoreActions

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      answersByQuestionId: {},
      skinType: readLegacySkinType(),
      concerns: [],
      isSubmitting: false,
      submitError: null,
      lastResult: null,
      setAnswer: (questionId, value) => {
        set((state) => ({
          answersByQuestionId: {
            ...state.answersByQuestionId,
            [questionId]: value,
          },
        }))
      },
      nextStep: () => {
        set((state) => ({ currentStep: state.currentStep + 1 }))
      },
      prevStep: () => {
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) }))
      },
      goToStep: (step) => {
        set({ currentStep: Math.max(1, step) })
      },
      setSkinType: (value) => {
        syncLegacySkinType(value)
        set({ skinType: value })
      },
      toggleConcern: (value) => {
        if (!VALID_CONCERNS.includes(value)) {
          return
        }

        set((state) => {
          const exists = state.concerns.includes(value)
          if (exists) {
            return {
              concerns: state.concerns.filter((item) => item !== value),
            }
          }

          return {
            concerns: [...state.concerns, value],
          }
        })
      },
      submitSurvey: async (authState) => {
        set({ isSubmitting: true, submitError: null })

        try {
          const payload = toSubmitPayload(get())
          const result = authState.isAuthenticated
            ? await apiClient.submitSurveyResult(payload, authState)
            : await apiClient.submitSurveyPreview(payload)

          set({
            isSubmitting: false,
            submitError: null,
            lastResult: result,
          })

          return result
        } catch (error) {
          const normalizedError = normalizeApiError(error)
          set({
            isSubmitting: false,
            submitError: normalizedError.message,
          })
          throw normalizedError
        }
      },
      resetSurvey: () => {
        syncLegacySkinType(null)
        set({
          currentStep: 1,
          answersByQuestionId: {},
          skinType: null,
          concerns: [],
          isSubmitting: false,
          submitError: null,
          lastResult: null,
        })
      },
      clearSubmitError: () => {
        set({ submitError: null })
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        answersByQuestionId: state.answersByQuestionId,
        skinType: state.skinType,
        concerns: state.concerns,
      }),
    }
  )
)
