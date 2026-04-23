import NavMenuDialog from '@/components/common/NavMenuDialog'
import { cn } from '@/lib/utils'

const ROOT_CLASS =
  'sticky top-0 z-10 flex h-12 w-full items-center justify-between px-5 py-2 transition-colors duration-450'
const TITLE_CLASS = 'text-[20px] font-medium leading-[27.6px]'

interface ResultPageHeaderProps {
  title: string
  className?: string
  isScrolled?: boolean
  tone?: 'default' | 'dark'
  hideTitle?: boolean
}

function ResultPageHeader({
  title,
  className,
  isScrolled = false,
  tone = 'default',
  hideTitle = false,
}: ResultPageHeaderProps) {
  const isDarkTone = tone === 'dark'

  return (
    <header
      className={cn(
        ROOT_CLASS,
        isDarkTone ? 'bg-neutral-800' : isScrolled ? 'bg-common-0' : 'bg-primary-150',
        className,
      )}
    >
      <h1 className={cn(TITLE_CLASS, isDarkTone ? 'text-common-0' : 'text-neutral-800', hideTitle && 'invisible')}>
        {title}
      </h1>
      <NavMenuDialog triggerClassName={isDarkTone ? '[&>img]:brightness-0 [&>img]:invert' : undefined} />
    </header>
  )
}

export default ResultPageHeader
