import type { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionTitleProps {
  children: ReactNode
  /** sm = text-sm / md = text-base(기본) / lg = text-lg */
  size?: 'sm' | 'md' | 'lg'
  /** 렌더링할 HTML 태그. 기본값 p */
  as?: ElementType
  className?: string
}

const sizeClass = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const

/**
 * 섹션 내부 소제목. PageHeading 보다 한 단계 아래 계층에 사용.
 */
function SectionTitle({ children, size = 'md', as: Tag = 'p', className }: SectionTitleProps) {
  return (
    <Tag className={cn(sizeClass[size], 'font-semibold text-neutral-800', className)}>
      {children}
    </Tag>
  )
}

export default SectionTitle
