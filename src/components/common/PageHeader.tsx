import AppLogo from '@/components/icons/AppLogo'
import NavMenuDialog from '@/components/common/NavMenuDialog'
import { cn } from '@/lib/utils'

const ROOT_CLASS =
  'sticky top-0 z-10 flex h-12 w-full items-center justify-between px-5 py-2 transition-colors duration-300'
const TITLE_CLASS = 'text-[20px] font-medium leading-[27.6px]'

interface PageHeaderProps {
  title?: string
  className?: string
  isScrolled?: boolean
  tone?: 'default' | 'dark' | 'light'
  showLogo?: boolean
}

function PageHeader({
  title,
  className,
  isScrolled = false,
  tone = 'default',
  showLogo = false,
}: PageHeaderProps) {
  const isDarkTone = tone === 'dark'
  const isLightTone = tone === 'light'
  const isWhiteContent = isDarkTone && !isScrolled

  return (
    <header
      className={cn(
        ROOT_CLASS,
        isLightTone
          ? 'bg-gradient-to-b from-[#F2FAFA] to-[#F2FAFA]/90 to-80%'
          : isDarkTone && !isScrolled
            ? 'bg-gradient-to-b from-neutral-800/90 via-neutral-800/60 via-40% to-neutral-800/15'
            : isScrolled
              ? 'bg-common-0'
              : 'bg-primary-150',
        className,
      )}
    >
      {showLogo ? (
        <AppLogo className={isWhiteContent ? 'text-common-0' : undefined} />
      ) : (
        <h1 className={cn(TITLE_CLASS, isWhiteContent ? 'text-common-0' : 'text-neutral-800')}>
          {title}
        </h1>
      )}
      <NavMenuDialog
        triggerClassName={isWhiteContent ? '[&>img]:brightness-0 [&>img]:invert' : undefined}
      />
    </header>
  )
}

export default PageHeader
