import { queryClient } from '../lib/queryClient'
import { useAuthStore } from '../stores/authStore'
import { useSurveyStore } from '../stores/surveyStore'

export function useLogout() {
  const logoutMock = useAuthStore((state) => state.logoutMock)
  const clearLatestResultId = useSurveyStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyStore((state) => state.clearSavedRoutine)

  return () => {
    logoutMock()
    queryClient.clear()
    clearLatestResultId()
    clearSavedRoutine()
  }
}
