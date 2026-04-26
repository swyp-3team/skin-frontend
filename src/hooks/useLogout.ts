import { apiClient } from '../api'
import { queryClient } from '../lib/queryClient'
import { useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)

  return () => {
    clearAuth()
    queryClient.clear()
    clearLatestResultId()
    clearSavedRoutine()
    apiClient.logout().catch(() => {})
  }
}
