import { useParams } from 'react-router-dom'

import PageHeading from '../components/common/PageHeading'
import SurfaceCard from '../components/common/SurfaceCard'
import MobilePage from '../components/MobilePage'
import { Button } from '../components/ui/button'

function ProductDetailPage() {
  const { id } = useParams()

  return (
    <MobilePage>
      <section className="space-y-5">
        <SurfaceCard>
          <div className="h-48 w-full rounded-[10px] bg-[#d9d9d9]" />
        </SurfaceCard>

        <div className="space-y-2">
          <p className="text-xs text-slate-500">제품 ID #{id ?? '-'}</p>
          <PageHeading>제품 상세</PageHeading>
          <p className="text-sm leading-6 text-slate-700">
            피부 고민과 성분 우선순위를 바탕으로 추천된 제품입니다. 주요 성분, 사용 순서, 주의사항을 확인해 주세요.
          </p>
        </div>

        <SurfaceCard className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">주요 정보</p>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>브랜드: 브랜드명</li>
            <li>카테고리: 세럼</li>
            <li>주요 성분: 히알루론산, 판테놀</li>
          </ul>
        </SurfaceCard>

        <Button className="h-auto w-full rounded-full px-6 py-3 text-sm" type="button" variant="cta">
          구매 링크로 이동
        </Button>
      </section>
    </MobilePage>
  )
}

export default ProductDetailPage
