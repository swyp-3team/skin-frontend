import type { ReactNode } from 'react'

import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import AppLogo from '@/components/icons/AppLogo'
import NavMenuDialog from '@/components/common/NavMenuDialog'
import { cn } from '@/lib/utils'

const BASE_CLASS = 'sticky top-0 z-10 h-12 w-full items-center px-5 transition-colors duration-300'
const TITLE_CLASS = 'text-[20px] font-medium leading-[27.6px]'
const SUB_TITLE_CLASS = 'truncate text-center text-[18px] font-medium leading-[25.56px] text-neutral-800'

interface PageHeaderProps {
  title?: string
  className?: string
  isScrolled?: boolean
  tone?: 'default' | 'dark' | 'light'
  showLogo?: boolean
  actionSlot?: ReactNode
  backTo?: string
  leftSlot?: ReactNode
}

function PageHeader({
  title,
  className,
  isScrolled = false,
  tone = 'default',
  showLogo = false,
  actionSlot = null,
  backTo,
  leftSlot,
}: PageHeaderProps) {
  const isSubPage = backTo !== undefined || leftSlot !== undefined

  if (isSubPage) {
    return (
      <header className={cn(BASE_CLASS, 'relative flex justify-center bg-common-0 py-2.5', className)}>
        <div className="absolute flex items-center justify-start left-5 top-1/2 -translate-y-1/2 whitespace-nowrap">
          {leftSlot ?? (
            <Link
              aria-label="뒤로 돌아가기"
              className="inline-flex size-[28px] items-center justify-start text-neutral-800"
              to={backTo!}
            >
              <ChevronLeft className="size-[28px] items-center justify-start" strokeWidth={1.8} />
            </Link>
          )}
        </div>

        <h1 className={SUB_TITLE_CLASS}>{title}</h1>

        <div className="absolute flex right-5 top-1/2 -translate-y-1/2">
          {actionSlot ?? <NavMenuDialog />}
        </div>
      </header>
    )
  }

  const isDarkTone = tone === 'dark'
  const isLightTone = tone === 'light'
  const isWhiteContent = isDarkTone && !isScrolled

  return (
    <header
      className={cn(
        BASE_CLASS,
        'flex justify-between py-2.5',
        isLightTone
          ? 'bg-[#F2FAFA]'
          : isDarkTone && !isScrolled
            ? 'bg-gradient-to-b from-neutral-800/90 via-neutral-800/60 via-40% to-neutral-800/15'
            : isScrolled
              ? 'bg-common-0'
              : 'bg-primary-150',
        className,
      )}
    >
      {showLogo ? (
        <Link to="/" aria-label="홈으로 이동">
          <AppLogo className={isWhiteContent ? 'text-common-0' : undefined} />
        </Link>
      ) : (
        <h1 className={cn(TITLE_CLASS, isWhiteContent ? 'text-common-0' : 'text-neutral-800')}>{title}</h1>
      )}

      <div className="flex items-center gap-4">
        {actionSlot}
        <NavMenuDialog
          triggerClassName={isWhiteContent ? '[&>img]:brightness-0 [&>img]:invert' : undefined}
        />
      </div>
    </header>
  )
}

export default PageHeader
