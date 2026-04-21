import { createResultDetailPath } from '@/app/routes'
import type { ResultHeaderViewModel } from './types'
import ResultSummaryCard from './ResultSummaryCard'

interface ResultTopSectionProps {
  intro: string
  skinResultId: number
  header: ResultHeaderViewModel
}

function ResultTopSection({ intro, skinResultId, header }: ResultTopSectionProps) {
  return (
    <section className="-mx-4 flex flex-col items-center gap-8 bg-primary-150 px-5 pb-7 pt-11.5">
      <p className="max-w-[288px] text-center text-[18px] font-medium leading-[25.56px] text-neutral-900 whitespace-pre-line">{intro}</p>
      <ResultSummaryCard
        diagnosedAt={header.diagnosedAt}
        diagnosisTitle={header.diagnosisTitle}
        resultDetailPath={createResultDetailPath(skinResultId)}
        summary={header.summary}
        tags={header.tags}
      />
    </section>
  )
}

export default ResultTopSection
