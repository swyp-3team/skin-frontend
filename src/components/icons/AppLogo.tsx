import { cn } from '@/lib/utils'

interface AppLogoProps {
  variant?: 'muted' | 'bold'
  className?: string
}

function AppLogo({ variant = 'bold', className }: AppLogoProps) {
  return (
    <span
      className={cn(
        'font-bold',
        variant === 'muted' && 'text-lg tracking-tighter text-neutral-400/30',
        variant === 'bold' && 'text-[24px] leading-[32.4px] text-neutral-800',
        className,
      )}
    >
      Layerd
    </span>
  )
}

export default AppLogo
