import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { APP_ROUTES, createResultProductsPath, createResultRoutinePath } from '../../app/routes'
import { ApiError } from '../../api/errors'
import AlertMessage from '../../components/common/AlertMessage'
import MobilePage from '../../components/MobilePage'
import ResultOverviewLayout from '../../components/results/ResultOverviewLayout'
import { fromResultDetail } from '../../components/results/resultOverviewViewModel'
import { useSurveyResultStore } from '../../stores/surveyResultStore'
import { useResultDetail } from './useResultDetail'

function ResultDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const resultId = Number(id)
  const { data: result, isLoading, error } = useResultDetail(resultId)
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

  if (!id || Number.isNaN(resultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          올바른 결과 ID가 아닙니다.
        </AlertMessage>
      </MobilePage>
    )
  }

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          결과를 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !result) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '결과를 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  return (
    <ResultOverviewLayout
      viewModel={fromResultDetail(result)}
      onRoutineCta={() => navigate(createResultRoutinePath(resultId))}
      onProductsCta={() => navigate(createResultProductsPath(resultId))}
    />
  )
}

export default ResultDetailPage
