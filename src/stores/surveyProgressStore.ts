import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { PreviewResult } from '../api/types'
import { STORAGE_KEYS } from '../constants/storage'

export interface SurveyProgressState {
  currentStep: number
  answersByStep: Record<number, number>
  previewResult: PreviewResult | null
  previewToken: string | null
}

export interface SurveyProgressActions {
  setStepAnswer: (step: number, optionNumber: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setPreviewResult: (result: PreviewResult) => void
  setPreviewToken: (token: string) => void
  /** previewResult와 previewToken을 함께 초기화. 의미상 항상 쌍으로 관리됨. */
  clearPreviewResult: () => void
  /** 설문 제출 후 진행 상태(스텝·답변)만 초기화. preview 데이터는 유지. */
  clearProgress: () => void
  /** 인트로 페이지의 수동 초기화. 모든 상태를 초기화. */
  resetSurvey: () => void
}

type SurveyProgressStore = SurveyProgressState & SurveyProgressActions

export const useSurveyProgressStore = create<SurveyProgressStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      answersByStep: {},
      previewResult: null,
      previewToken: null,
      setStepAnswer: (step, optionNumber) => {
        set((state) => ({
          answersByStep: { ...state.answersByStep, [step]: optionNumber },
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
      setPreviewToken: (token) => {
        set({ previewToken: token })
      },
      clearPreviewResult: () => {
        set({ previewResult: null, previewToken: null })
      },
      clearProgress: () => {
        set({ currentStep: 1, answersByStep: {} })
      },
      resetSurvey: () => {
        set({ currentStep: 1, answersByStep: {}, previewResult: null, previewToken: null })
      },
    }),
    {
      name: STORAGE_KEYS.surveyProgress,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
