import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { APP_ROUTES, createResultProductsPath, createResultRoutinePath } from '../../app/routes'
import { ApiError } from '../../api/errors'
import AlertMessage from '../../components/common/AlertMessage'
import MobilePage from '../../components/MobilePage'
import ResultOverviewScreen from '../../components/results/ResultOverviewScreen'
import ResultPageHeader from '../../components/results/ResultPageHeader'
import { fromResultDetail } from '../../components/results/resultOverviewViewModel'
import { useSurveyResultStore } from '../../stores/surveyResultStore'
import { useResultDetail } from './useResultDetail'

function ResultDetailPage() {
  const PAGE_TITLE = '진단 결과'
  const navigate = useNavigate()
  const { resultId, data: result, isLoading, error } = useResultDetail()
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)

  useEffect(() => {
    if (!error) {
      return
    }

    const status = error instanceof ApiError ? error.status : 0
    if (status === 401 || status === 404) {
      clearLatestResultId()
      navigate(APP_ROUTES.survey, { replace: true })
    }
  }, [error, clearLatestResultId, navigate])

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          寃곌낵瑜?遺덈윭?ㅻ뒗 以묒엯?덈떎...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !result || Number.isNaN(resultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '寃곌낵瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const viewModel = fromResultDetail(result)

  return (
    <MobilePage className="bg-neutral-800" header={<ResultPageHeader title={PAGE_TITLE} tone="dark" hideTitle={true} />} mainClassName="overflow-x-hidden p-0">
      <ResultOverviewScreen
        mode="full"
        onProductsCtaClick={() => navigate(createResultProductsPath(resultId))}
        onRoutineCtaClick={() => navigate(createResultRoutinePath(resultId))}
        viewModel={viewModel}
      />
    </MobilePage>
  )
}

export default ResultDetailPage
