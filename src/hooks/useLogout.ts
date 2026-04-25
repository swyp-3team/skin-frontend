import { useShallow } from 'zustand/react/shallow'

import { apiClient } from '../api'
import { queryClient } from '../lib/queryClient'
import { useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'

export function useLogout() {
  const { accessToken, clearAuth } = useAuthStore(
    useShallow((state) => ({ accessToken: state.accessToken, clearAuth: state.clearAuth })),
  )
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)

  return () => {
    const token = accessToken
    clearAuth()
    queryClient.clear()
    clearLatestResultId()
    clearSavedRoutine()
    if (token) {
      apiClient.logout(token).catch(() => {})
    }
  }
}
