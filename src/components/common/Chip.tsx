import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ChipProps {
  children: ReactNode
  variant?: 'filled' | 'outlined' | 'white-rounded'
  className?: string
}

/**
 * 성분군·카테고리·단계 등 인라인 레이블 배지.
 * filled  — bg-neutral-200 (회색 채움, 기본)
 * outlined — bg-neutral-0 + border (흰 배경 테두리)
 */
function Chip({ children, variant = 'filled', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-3 py-1 text-xs font-medium',
        variant === 'filled' && 'bg-neutral-200 text-neutral-800',
        variant === 'outlined' && 'border border-neutral-200 bg-neutral-0 text-neutral-600',
        variant === 'white-rounded' && 'rounded-full text-3xl font-semibold px-5 border-2 border-neutral-800 text-neutral-800 bg-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Chip
