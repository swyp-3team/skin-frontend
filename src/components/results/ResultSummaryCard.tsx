import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import ResultMiniTag from './ResultMiniTag'

interface ResultSummaryCardProps {
  diagnosisTitle: string
  tags: readonly string[]
  summary: string
  diagnosedAt: string
  resultDetailPath: string
  isCollapsed?: boolean
  className?: string
}

interface DiagnosedAtDisplay {
  date: string
  time: string
}

function toDiagnosedAtDisplay(value: string): DiagnosedAtDisplay {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return { date: '-', time: '--:--' }
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  const hour = String(parsedDate.getHours()).padStart(2, '0')
  const minute = String(parsedDate.getMinutes()).padStart(2, '0')

  return {
    date: `${year}.${month}.${day}`,
    time: `${hour}:${minute}`,
  }
}

function ResultSummaryCard({
  diagnosisTitle,
  tags,
  summary,
  diagnosedAt,
  resultDetailPath,
  isCollapsed = false,
  className,
}: ResultSummaryCardProps) {
  const diagnosedAtDisplay = toDiagnosedAtDisplay(diagnosedAt)

  return (
    <article className={cn('flex w-full flex-col gap-3 rounded-2xl bg-common-0 p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">{diagnosisTitle}</h3>
        <div className="flex flex-wrap justify-end gap-1">
          {tags.map((tag) => (
            <ResultMiniTag key={tag}>{tag}</ResultMiniTag>
          ))}
        </div>
      </div>

      <p
        className={cn(
          'overflow-hidden text-[15px] font-normal leading-[22.2px] text-neutral-800 transition-all duration-500 motion-reduce:transition-none',
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-200 opacity-100',
        )}
      >
        {summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="text-[14px] flex items-center gap-1 font-light leading-[20.44px] text-neutral-400">
          <span>{diagnosedAtDisplay.date}</span>
          <span>{diagnosedAtDisplay.time}</span>
        </div>

        <Link
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium leading-[16.32px] text-neutral-400 transition-colors hover:text-neutral-500"
          to={resultDetailPath}
        >
          <span>결과보기</span>
          <span aria-hidden>›</span>
        </Link>
      </div>
    </article>
  )
}

export default ResultSummaryCard
