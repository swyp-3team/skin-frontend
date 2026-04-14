import AlertMessage from '../../components/common/AlertMessage'
import PageHeading from '../../components/common/PageHeading'
import MobilePage from '../../components/MobilePage'
import RecommendedProductsList from '../../components/survey/RecommendedProductsList'
import { SURVEY_RESULT_COPY } from '../../constants/survey'
import { useResultDetail } from './useResultDetail'

function ResultProductsPage() {
  const { data: result, isLoading, error } = useResultDetail()

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
    <MobilePage>
      <section className="space-y-7 pb-10">
        <PageHeading>{SURVEY_RESULT_COPY.productsPageTitle}</PageHeading>
        <RecommendedProductsList products={result.recommendedProducts} />
      </section>
    </MobilePage>
  )
}

export default ResultProductsPage
