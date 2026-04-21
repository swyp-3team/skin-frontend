import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ResultMiniTagProps {
  children: ReactNode
  className?: string
}

function ResultMiniTag({ children, className }: ResultMiniTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[20px] bg-neutral-600 px-2 py-1 text-[11px] font-normal leading-[14.3px] text-neutral-200',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default ResultMiniTag
