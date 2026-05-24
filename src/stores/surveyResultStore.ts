import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../constants/storage'

interface PersistedSurveyResultState {
  latestResultId: number | null
}

function getPersistedNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  return typeof value === 'number' ? value : null
}

function migrateSurveyResultState(persistedState: unknown): PersistedSurveyResultState {
  if (!persistedState || typeof persistedState !== 'object') {
    return {
      latestResultId: null,
    }
  }

  const record = persistedState as Record<string, unknown>

  return {
    latestResultId: getPersistedNumber(record, 'latestResultId'),
  }
}

export interface SurveyResultState {
  latestResultId: number | null
}

export interface SurveyResultActions {
  setLatestResultId: (id: number) => void
  clearLatestResultId: () => void
}

type SurveyResultStore = SurveyResultState & SurveyResultActions

export const useSurveyResultStore = create<SurveyResultStore>()(
  persist(
    (set) => ({
      latestResultId: null,
      setLatestResultId: (id) => {
        set({ latestResultId: id })
      },
      clearLatestResultId: () => {
        set({ latestResultId: null })
      },
    }),
    {
      name: STORAGE_KEYS.surveyResult,
      version: 3,
      migrate: migrateSurveyResultState,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
