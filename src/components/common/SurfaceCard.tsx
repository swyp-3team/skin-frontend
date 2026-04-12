import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const surfaceCardVariants = cva('bg-card-bg p-4', {
  variants: {
    density: {
      default: 'rounded-[12px]',
      compact: 'rounded-[8px]',
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceCardVariants> {
  children: ReactNode
}

function SurfaceCard({ children, className, density, ...props }: SurfaceCardProps) {
  return (
    <div className={cn(surfaceCardVariants({ density }), className)} {...props}>
      {children}
    </div>
  )
}

export default SurfaceCard
