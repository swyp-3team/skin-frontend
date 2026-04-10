import { APP_ROUTES } from '../app/routes'
import PageHeading from '../components/common/PageHeading'
import PillCtaLink from '../components/common/PillCtaLink'
import MobilePage from '../components/MobilePage'

function NotFoundPage() {
  return (
    <MobilePage>
      <section className="space-y-5">
        <PageHeading>페이지를 찾을 수 없습니다</PageHeading>
        <p className="text-sm leading-6 text-slate-600">
          요청하신 경로가 존재하지 않습니다. 홈으로 돌아가 다시 시작해주세요.
        </p>
        <PillCtaLink className="px-6 py-3 text-sm" to={APP_ROUTES.home}>
          홈으로 이동
        </PillCtaLink>
      </section>
    </MobilePage>
  )
}

export default NotFoundPage
