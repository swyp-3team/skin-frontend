import { IconX } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

interface CloseButtonProps {
  onClick: () => void
  'aria-label'?: string
  className?: string
}

function CloseButton({ onClick, 'aria-label': ariaLabel = '닫기', className }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={ariaLabel}
      className={cn('inline-flex shrink-0 items-center justify-center rounded transition-colors', className)}
    >
      <IconX size={28} strokeWidth={1.9} className="text-neutral-800" />
    </button>
  )
}

export default CloseButton
