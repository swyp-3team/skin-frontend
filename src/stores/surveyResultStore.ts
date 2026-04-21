import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { FullResult } from '../api/types'
import { STORAGE_KEYS } from '../constants/storage'

export function createSavedRoutineKey(result: FullResult): string {
  return JSON.stringify(result.routine)
}

export function createSavedRoutineGroupKey(routineGroupId: number): string {
  return `routine-group:${routineGroupId}`
}

export interface SurveyResultState {
  latestResultId: number | null
  savedRoutineKey: string | null
  savedRoutineName: string | null
}

export interface SurveyResultActions {
  setLatestResultId: (id: number) => void
  clearLatestResultId: () => void
  markRoutineSaved: (result: FullResult, routineName?: string) => void
  markRoutineSavedByKey: (routineKey: string, routineName?: string) => void
  clearSavedRoutine: () => void
}

type SurveyResultStore = SurveyResultState & SurveyResultActions

export const useSurveyResultStore = create<SurveyResultStore>()(
  persist(
    (set) => ({
      latestResultId: null,
      savedRoutineKey: null,
      savedRoutineName: null,
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
      markRoutineSavedByKey: (routineKey, routineName) => {
        set({
          savedRoutineKey: routineKey,
          savedRoutineName: routineName ?? null,
        })
      },
      clearSavedRoutine: () => {
        set({ savedRoutineKey: null, savedRoutineName: null })
      },
    }),
    {
      name: STORAGE_KEYS.surveyResult,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
