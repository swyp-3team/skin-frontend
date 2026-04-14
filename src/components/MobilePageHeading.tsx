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
    <header className={cn('w-full h-13 grid grid-cols-[1fr_auto_1fr] items-center backdrop-blur-sm shadow-[0_3px_10px_rgba(0,0,0,0.05)]', className)}>
      <div className="flex items-center justify-start pl-3">{left}</div>
      <div className="flex items-center justify-center">{center}</div>
      <div className="flex items-center justify-end pr-3">{right}</div>
    </header>
  )
}

export default MobilePageHeading
