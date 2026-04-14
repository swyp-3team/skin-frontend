import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { SKIN_TYPE_OPTIONS, VALID_CONCERNS } from '../domain/surveyConfig'
import type { FullResult } from '../api/types'
import { STORAGE_KEYS } from '../constants/storage'
import type { Concern, SkinTypeSelection } from '../types/domain'

export const LEGACY_SKIN_TYPE_KEY = STORAGE_KEYS.legacySurveySkinType
const SESSION_STORAGE_KEY = STORAGE_KEYS.surveySession

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

export interface SurveyStoreState {
  currentStep: number
  answersByQuestionId: Record<number, number>
  skinType: SkinTypeSelection | null
  concerns: Concern[]
  latestResultId: number | null
  savedRoutineKey: string | null
}

export interface SurveyStoreActions {
  setAnswer: (questionId: number, value: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setSkinType: (value: SkinTypeSelection) => void
  toggleConcern: (value: Concern) => void
  setLatestResultId: (id: number) => void
  clearLatestResultId: () => void
  markRoutineSaved: (result: FullResult) => void
  clearSavedRoutine: () => void
  resetSurvey: () => void
}

type SurveyStore = SurveyStoreState & SurveyStoreActions

export function createSavedRoutineKey(result: FullResult): string {
  return JSON.stringify(result.routine)
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      answersByQuestionId: {},
      skinType: readLegacySkinType(),
      concerns: [],
      latestResultId: null,
      savedRoutineKey: null,
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
      setLatestResultId: (id) => {
        set({ latestResultId: id })
      },
      clearLatestResultId: () => {
        set({ latestResultId: null })
      },
      markRoutineSaved: (result) => {
        set({ savedRoutineKey: createSavedRoutineKey(result) })
      },
      clearSavedRoutine: () => {
        set({ savedRoutineKey: null })
      },
      resetSurvey: () => {
        syncLegacySkinType(null)
        set({
          currentStep: 1,
          answersByQuestionId: {},
          skinType: null,
          concerns: [],
          savedRoutineKey: null,
          // latestResultId는 유지: 결과는 설문 재시작과 무관
        })
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
        latestResultId: state.latestResultId,
        savedRoutineKey: state.savedRoutineKey,
      }),
    }
  )
)
