import { createResultDetailPath } from '@/app/routes'
import { useScrollCollapse } from '@/hooks/useScrollCollapse'
import type { ResultHeaderViewModel } from './types'
import ResultSummaryCard from './ResultSummaryCard'

// ResultPageHeader 높이(h-12 = 48px)만큼 보정 — 스크롤 시작 즉시 접힘 트리거
const HEADER_ROOT_MARGIN = '-48px 0px 0px 0px'

interface ResultTopSectionProps {
  intro: string
  skinResultId: number
  header: ResultHeaderViewModel
}

function ResultTopSection({ intro, skinResultId, header }: ResultTopSectionProps) {
  const { ref: sentinelRef, isCollapsed } = useScrollCollapse<HTMLDivElement>(HEADER_ROOT_MARGIN)

  return (
    <>
      {/* 스크롤 감지 sentinel: 민트·카드 레이아웃과 독립 → oscillation 없음 */}
      <div ref={sentinelRef} aria-hidden className="-mx-4 h-px bg-primary-150" />

      <section className="-mx-4 flex flex-col items-center gap-8 bg-primary-150 px-5 pb-7 pt-11.5">
        <p className="max-w-[288px] whitespace-pre-line text-center text-[18px] font-medium leading-[25.56px] text-common-1000">
          {intro}
        </p>

        <ResultSummaryCard
          isCollapsed={isCollapsed}
          diagnosedAt={header.diagnosedAt}
          diagnosisTitle={header.diagnosisTitle}
          resultDetailPath={createResultDetailPath(skinResultId)}
          summary={header.summary}
          tags={header.tags}
        />
      </section>
    </>
  )
}

export default ResultTopSection
