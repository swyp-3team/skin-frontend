import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ChipProps {
  children: ReactNode
  variant?: 'filled' | 'outlined' | 'white-rounded'
  className?: string
}

/**
 * 성분군·카테고리·단계 등 인라인 레이블 배지.
 * filled  — bg-chip-bg (회색 채움, 기본)
 * outlined — bg-white + border (흰 배경 테두리)
 */
function Chip({ children, variant = 'filled', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-3 py-1 text-xs font-medium',
        variant === 'filled' && 'bg-chip-bg text-slate-800',
        variant === 'outlined' && 'border border-card-border bg-white text-slate-700',
        variant === 'white-rounded' && 'rounded-full text-3xl font-semibold px-5 border-2 border-slate-900 text-slate-900 bg-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Chip
