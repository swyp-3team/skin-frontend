import { Navigate } from 'react-router-dom'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import MobilePage from '../../../components/MobilePage'
import ResultOverviewScreen from '../../../components/results/ResultOverviewScreen'
import ResultPageHeader from '../../../components/results/ResultPageHeader'
import { fromPreviewResult } from '../../../components/results/resultOverviewViewModel'
import LoginDialog from '../../../components/survey/LoginDialog'
import { selectIsAuthenticated, useAuthStore } from '../../../stores/authStore'
import { useSurveyProgressStore } from '../../../stores/surveyProgressStore'
import { useSurveyResultStore } from '../../../stores/surveyResultStore'
import { useLoginAndPromote } from './useLoginAndPromote'

function SurveyResultPage() {
  const PAGE_TITLE = '진단 결과'
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

  const viewModel = fromPreviewResult(previewResult)

  const openLoginDialog = () => setIsLoginModalOpen(true)

  return (
    <>
      <MobilePage
        className="bg-neutral-800"
        header={<ResultPageHeader hideTitle title={PAGE_TITLE} tone="dark" />}
        mainClassName="overflow-x-hidden p-0"
      >
        <ResultOverviewScreen
          mode="preview"
          onPreviewLoginClick={openLoginDialog}
          onProductsCtaClick={openLoginDialog}
          onRoutineCtaClick={openLoginDialog}
          viewModel={viewModel}
        />
      </MobilePage>

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
