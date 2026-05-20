import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface CtaButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
}

function CtaButton({ children, className, type = 'button', ...props }: CtaButtonProps) {
  return (
    <div className="inline-flex h-full w-full items-start justify-start">
      <button
        className={cn(
          'flex min-w-[70px] flex-1 items-center justify-center gap-2.5 rounded-[8px] bg-neutral-800 px-6 py-3 disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        type={type}
        {...props}
      >
        <span className="text-center text-base font-medium leading-[23.68px] text-common-0">{children}</span>
      </button>
    </div>
  )
}

export default CtaButton
