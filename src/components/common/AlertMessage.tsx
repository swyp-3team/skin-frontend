import type { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type AlertVariant = 'info' | 'warning' | 'error'

const variantStyles: Record<AlertVariant, string> = {
  info: 'border-transparent bg-neutral-100 text-neutral-600',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

interface AlertMessageProps {
  children: ReactNode
  variant?: AlertVariant
  /** sm = 인라인(px-3 py-2) / md = 독립 블록(px-4 py-5, 기본) */
  size?: 'sm' | 'md'
  as?: ElementType
  className?: string
}

/**
 * 인라인 알림 메시지 — 유효성 오류, 로드 실패, 경고 안내 등.
 * variant: info(회색) / warning(노란) / error(붉은)
 * size: sm(inline), md(standalone block)
 */
function AlertMessage({ children, variant = 'error', size = 'sm', as: Tag = 'p', className }: AlertMessageProps) {
  return (
    <Tag
      className={cn(
        'border text-sm',
        size === 'sm' ? 'rounded-[10px] px-3 py-2' : 'rounded-[12px] px-4 py-5',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export default AlertMessage
