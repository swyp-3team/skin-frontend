import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../constants/storage'

interface PersistedSurveyResultState {
  latestResultId: number | null
  savedResultId: number | null
  savedRoutineName: string | null
}

function getPersistedNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  return typeof value === 'number' ? value : null
}

function getPersistedString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' ? value : null
}

function migrateSurveyResultState(persistedState: unknown): PersistedSurveyResultState {
  if (!persistedState || typeof persistedState !== 'object') {
    return {
      latestResultId: null,
      savedResultId: null,
      savedRoutineName: null,
    }
  }

  const record = persistedState as Record<string, unknown>

  return {
    latestResultId: getPersistedNumber(record, 'latestResultId'),
    savedResultId: getPersistedNumber(record, 'savedResultId'),
    savedRoutineName: getPersistedString(record, 'savedRoutineName'),
  }
}

export interface SurveyResultState {
  latestResultId: number | null
  savedResultId: number | null
  savedRoutineName: string | null
}

export interface SurveyResultActions {
  setLatestResultId: (id: number) => void
  clearLatestResultId: () => void
  markRoutineSavedByResultId: (resultId: number, routineName?: string) => void
  clearSavedRoutine: () => void
}

type SurveyResultStore = SurveyResultState & SurveyResultActions

export const useSurveyResultStore = create<SurveyResultStore>()(
  persist(
    (set) => ({
      latestResultId: null,
      savedResultId: null,
      savedRoutineName: null,
      setLatestResultId: (id) => {
        set({ latestResultId: id })
      },
      clearLatestResultId: () => {
        set({ latestResultId: null })
      },
      markRoutineSavedByResultId: (resultId, routineName) => {
        set({
          savedResultId: resultId,
          savedRoutineName: routineName ?? null,
        })
      },
      clearSavedRoutine: () => {
        set({ savedResultId: null, savedRoutineName: null })
      },
    }),
    {
      name: STORAGE_KEYS.surveyResult,
      version: 2,
      migrate: migrateSurveyResultState,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
