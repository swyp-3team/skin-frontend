import { Link } from 'react-router-dom'

import resultSummaryChevronRightIcon from '@/assets/icons/results/result-summary-chevron-right.svg'
import { cn } from '@/lib/utils'
import ResultMiniTag from './ResultMiniTag'

interface ResultSummaryCardProps {
  diagnosisTitle: string
  subtitle: string
  summary: string
  diagnosedAt: string
  resultDetailPath: string
  isCollapsed?: boolean
  className?: string
}

interface DiagnosedAtDisplay {
  date: string
  time: string | null
}

function toDiagnosedAtDisplay(value: string): DiagnosedAtDisplay {
  const matchedDate = value.match(/^(\d{4})[./-](\d{2})[./-](\d{2})(?:\s+(\d{2}):(\d{2}))?$/)
  if (matchedDate) {
    const [, year, month, day, hour, minute] = matchedDate
    return {
      date: `${year}.${month}.${day}`,
      time: hour && minute ? `${hour}:${minute}` : null,
    }
  }

  const parsedDate = new Date(value)
  if (!Number.isNaN(parsedDate.getTime())) {
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

  return { date: '-', time: null }
}

function ResultSummaryCard({
  diagnosisTitle,
  subtitle,
  summary,
  diagnosedAt,
  resultDetailPath,
  isCollapsed = false,
  className,
}: ResultSummaryCardProps) {
  const diagnosedAtDisplay = toDiagnosedAtDisplay(diagnosedAt)
  const subtitleTag = subtitle.trim()

  return (
    <article className={cn('gap-2 flex w-full flex-col rounded-2xl bg-common-0 p-4', className)}>
      <div className="flex flex-col justify-end gap-2">
        <ResultMiniTag>{diagnosisTitle}</ResultMiniTag>
        <h3 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">{subtitleTag}</h3>
      </div>

      <p
        className={cn(
          'overflow-hidden text-[15px] font-normal leading-[22.2px] text-neutral-800',
          'transition-all duration-500 motion-reduce:transition-none',
          isCollapsed ? 'mt-0 max-h-0 opacity-0' : 'mt-3 max-h-[300px] opacity-100',
        )}
      >
        {summary}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[14px] font-light leading-[20.44px] text-neutral-400">
          <span>{diagnosedAtDisplay.date}</span>
          {diagnosedAtDisplay.time ? <span>{diagnosedAtDisplay.time}</span> : null}
        </div>

        <Link
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium leading-[16.32px] text-neutral-400 transition-colors hover:text-neutral-500"
          to={resultDetailPath}
        >
          <span>결과보기</span>
          <img alt="" aria-hidden className="size-4" src={resultSummaryChevronRightIcon} />
        </Link>
      </div>
    </article>
  )
}

export default ResultSummaryCard
