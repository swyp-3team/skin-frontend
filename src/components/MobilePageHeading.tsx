import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import CloseButton from '@/components/common/CloseButton'
import NavMenuDialog from '@/components/common/NavMenuDialog'

export { CloseButton }

interface MobilePageHeadingProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
}

const DEFAULT_LEFT = (
  <span className="text-lg font-bold leading-none tracking-tighter text-[#767774]/30">Layerd</span>
)

const DEFAULT_RIGHT = <NavMenuDialog />

function MobilePageHeading({ left = DEFAULT_LEFT, center, right = DEFAULT_RIGHT, className }: MobilePageHeadingProps) {
  return (
    <header className={cn('w-full py-4 px-5 grid grid-cols-[1fr_auto_1fr] items-center  backdrop-blur-[3px] bg-white border-b border-[#EDEEED] shadow-[0_3px_10px_rgba(0,0,0,0.05)]', className)}>
      <div className="flex items-center justify-start">{left}</div>
      <div className="flex items-center justify-center">{center}</div>
      <div className="flex items-center justify-end">{right}</div>
    </header>
  )
}

export default MobilePageHeading

/* shadow-[0_3px_10px_rgba(0,0,0,0.05)] bg-gradient-to-b from-white/85 to-white/10*/