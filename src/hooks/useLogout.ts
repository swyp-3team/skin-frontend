import { queryClient } from '../lib/queryClient'
import { useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'

export function useLogout() {
  const logoutMock = useAuthStore((state) => state.logoutMock)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)

  return () => {
    logoutMock()
    queryClient.clear()
    clearLatestResultId()
    clearSavedRoutine()
  }
}
