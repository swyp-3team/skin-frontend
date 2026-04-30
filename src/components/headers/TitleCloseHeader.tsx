import CloseButton from '@/components/common/CloseButton'
import { cn } from '@/lib/utils'

const ROOT_BASE = 'sticky top-0 z-10 h-12 w-full grid grid-cols-[1fr_auto_1fr] items-center px-5 py-2.5'

interface TitleCloseHeaderProps {
  title: string
  onClose: () => void
  tone?: 'light' | 'dark'
  className?: string
}

function TitleCloseHeader({ title, onClose, tone = 'light', className }: TitleCloseHeaderProps) {
  return (
    <header className={cn(ROOT_BASE, tone === 'dark' ? 'bg-neutral-800' : 'bg-common-0', className)}>
      <span aria-hidden className="size-7 shrink-0" />
      <div
        className={cn(
          'flex items-center justify-center text-[18px] leading-[25.56px] font-medium',
          tone === 'dark' ? 'text-neutral-200' : 'text-neutral-800',
        )}
      >
        {title}
      </div>
      <div className="flex items-center justify-end">
        <CloseButton
          onClick={onClose}
          aria-label="\uB2EB\uAE30"
          iconClassName={tone === 'dark' ? 'text-neutral-200' : undefined}
        />
      </div>
    </header>
  )
}

export default TitleCloseHeader
