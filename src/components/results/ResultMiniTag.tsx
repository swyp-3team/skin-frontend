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
        'inline-flex items-center justify-center w-fit rounded-[4px] bg-primary-100 px-1.5 py-0.5 text-[10px] font-normal leading-[14.3px] text-primary-500',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default ResultMiniTag
