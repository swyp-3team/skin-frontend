import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { FullResult, PreviewResult } from '../api/types'
import { STORAGE_KEYS } from '../constants/storage'

const SESSION_STORAGE_KEY = STORAGE_KEYS.surveySession

export interface SurveyStoreState {
  currentStep: number
  answersByQuestionId: Record<number, number>
  previewResult: PreviewResult | null
  latestResultId: number | null
  savedRoutineKey: string | null
  savedRoutineName: string | null
}

export interface SurveyStoreActions {
  setAnswer: (questionId: number, value: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setPreviewResult: (result: PreviewResult) => void
  clearPreviewResult: () => void
  setLatestResultId: (id: number) => void
  clearLatestResultId: () => void
  markRoutineSaved: (result: FullResult, routineName?: string) => void
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
      previewResult: null,
      latestResultId: null,
      savedRoutineKey: null,
      savedRoutineName: null,
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
      setPreviewResult: (result) => {
        set({ previewResult: result })
      },
      clearPreviewResult: () => {
        set({ previewResult: null })
      },
      setLatestResultId: (id) => {
        set({ latestResultId: id })
      },
      clearLatestResultId: () => {
        set({ latestResultId: null })
      },
      markRoutineSaved: (result, routineName) => {
        set({
          savedRoutineKey: createSavedRoutineKey(result),
          savedRoutineName: routineName ?? null,
        })
      },
      clearSavedRoutine: () => {
        set({
          savedRoutineKey: null,
          savedRoutineName: null,
        })
      },
      resetSurvey: () => {
        set({
          currentStep: 1,
          answersByQuestionId: {},
          previewResult: null,
          savedRoutineKey: null,
          savedRoutineName: null,
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
        previewResult: state.previewResult,
        latestResultId: state.latestResultId,
        savedRoutineKey: state.savedRoutineKey,
        savedRoutineName: state.savedRoutineName,
      }),
    }
  )
)
