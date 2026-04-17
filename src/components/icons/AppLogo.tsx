import { cn } from '@/lib/utils'

interface AppLogoProps {
  variant?: 'muted' | 'bold'
  className?: string
}

function AppLogo({ variant = 'muted', className }: AppLogoProps) {
  return (
    <span
      className={cn(
        'font-bold leading-none',
        variant === 'muted' && 'text-lg tracking-tighter text-neutral-400/30',
        variant === 'bold' && 'text-[1.75rem] text-neutral-800',
        className,
      )}
    >
      Layer&apos;d
    </span>
  )
}

export default AppLogo
