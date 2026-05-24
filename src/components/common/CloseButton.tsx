import { IconX } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

interface CloseButtonProps {
  onClick: () => void
  'aria-label'?: string
  className?: string
  iconClassName?: string
}

function CloseButton({
  onClick,
  'aria-label': ariaLabel = '\uB2EB\uAE30',
  className,
  iconClassName,
}: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={ariaLabel}
      className={cn('inline-flex shrink-0 items-center justify-center rounded transition-colors', className)}
    >
      <IconX size={28} strokeWidth={1.9} className={cn('text-neutral-800', iconClassName)} />
    </button>
  )
}

export default CloseButton
