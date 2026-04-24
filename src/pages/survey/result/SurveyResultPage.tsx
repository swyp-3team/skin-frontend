import { Navigate } from 'react-router-dom'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import ResultOverviewLayout from '../../../components/results/ResultOverviewLayout'
import { fromPreviewResult } from '../../../components/results/resultOverviewViewModel'
import LoginDialog from '../../../components/survey/LoginDialog'
import { Button } from '../../../components/ui/button'
import { selectIsAuthenticated, useAuthStore } from '../../../stores/authStore'
import { useSurveyProgressStore } from '../../../stores/surveyProgressStore'
import { useSurveyResultStore } from '../../../stores/surveyResultStore'
import { useLoginAndPromote } from './useLoginAndPromote'

function PreviewBlurOverlay({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 rounded-t-2xl">
      <div className="absolute inset-0 rounded-t-2xl bg-common-0/60 backdrop-blur-[4px]" />
      <div className="pointer-events-auto absolute inset-x-4 top-20">
        <Button
          className="h-auto w-full rounded-full border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold text-neutral-600"
          onClick={onLoginClick}
          type="button"
          variant="outline"
        >
          로그인하고 전체 결과보기
        </Button>
      </div>
    </div>
  )
}

function SurveyResultPage() {
  const previewResult = useSurveyProgressStore((state) => state.previewResult)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const latestResultId = useSurveyResultStore((state) => state.latestResultId)
  const { isLoginModalOpen, setIsLoginModalOpen, isPromoting, promoteToFullResult } = useLoginAndPromote()

  if (isAuthenticated && latestResultId != null) {
    return <Navigate replace to={createResultDetailPath(latestResultId)} />
  }

  if (!previewResult) {
    return <Navigate replace to={APP_ROUTES.survey} />
  }

  const openLoginDialog = () => setIsLoginModalOpen(true)

  return (
    <>
      <ResultOverviewLayout
        viewModel={fromPreviewResult(previewResult)}
        onRoutineCta={openLoginDialog}
        onProductsCta={openLoginDialog}
        cardOverlay={<PreviewBlurOverlay onLoginClick={openLoginDialog} />}
      />

      <LoginDialog
        isPromoting={isPromoting}
        onLogin={promoteToFullResult}
        onOpenChange={setIsLoginModalOpen}
        open={isLoginModalOpen}
        variant="result"
      />
    </>
  )
}

export default SurveyResultPage
