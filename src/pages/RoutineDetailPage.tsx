import { useParams } from 'react-router-dom'

import PageHeading from '../components/common/PageHeading'
import RoutineItem from '../components/common/RoutineItem'
import SectionTitle from '../components/common/SectionTitle'
import SurfaceCard from '../components/common/SurfaceCard'
import MobilePage from '../components/MobilePage'

const routineSteps = [
  { category: '토너', guide: '진정 성분으로 세안 후 피부결을 먼저 정돈해 주세요.' },
  { category: '세럼', guide: '집중 성분으로 고민 부위를 세심하게 관리해 주세요.' },
  { category: '크림', guide: '보습막을 형성해 피부를 편안하게 마무리해 주세요.' },
]

function RoutineDetailPage() {
  const { id } = useParams()

  return (
    <MobilePage>
      <section className="space-y-5">
        <PageHeading>나의 루틴</PageHeading>

        <SurfaceCard className="space-y-3">
          <p className="text-xs text-neutral-400">루틴 그룹 #{id ?? '-'}</p>
          <p className="text-sm leading-6 text-neutral-600">
            아침과 저녁 루틴을 나눠 현재 피부 컨디션에 맞게 관리해 보세요.
          </p>
        </SurfaceCard>

        <div className="space-y-3">
          <SectionTitle>아침 루틴</SectionTitle>
          <SurfaceCard className="space-y-2" density="compact">
            {routineSteps.map((step) => (
              <RoutineItem badge={step.category} guide={step.guide} key={`am-${step.category}`} />
            ))}
          </SurfaceCard>
        </div>

        <div className="space-y-3">
          <SectionTitle>저녁 루틴</SectionTitle>
          <SurfaceCard className="space-y-2" density="compact">
            {routineSteps.map((step) => (
              <RoutineItem badge={step.category} guide={step.guide} key={`pm-${step.category}`} />
            ))}
          </SurfaceCard>
        </div>
      </section>
    </MobilePage>
  )
}

export default RoutineDetailPage
