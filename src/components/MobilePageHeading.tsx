import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import CloseButton from '@/components/common/CloseButton'

export { CloseButton }

interface MobilePageHeadingProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
}

const DEFAULT_LEFT = (
  <span className="text-app-title font-bold leading-none tracking-tighter text-slate-950">Layerd</span>
)

function MobilePageHeading({ left = DEFAULT_LEFT, center, right, className }: MobilePageHeadingProps) {
  return (
    <header className={cn('h-14 grid grid-cols-[1fr_auto_1fr] items-center', className)}>
      <div className="flex items-center justify-start">{left}</div>
      <div className="flex items-center justify-center">{center}</div>
      <div className="flex items-center justify-end">{right}</div>
    </header>
  )
}

export default MobilePageHeading
