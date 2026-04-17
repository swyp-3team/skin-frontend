import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pageHeadingVariants = cva('font-semibold tracking-tight text-neutral-900', {
  variants: {
    size: {
      default: 'text-page-title leading-[1.35]',
      lg: 'text-page-title-lg leading-[1.35]',
      md: 'text-[1.5rem] leading-[1.35]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

interface PageHeadingProps extends VariantProps<typeof pageHeadingVariants> {
  children: ReactNode
  className?: string
}

function PageHeading({ children, className, size }: PageHeadingProps) {
  return <h2 className={cn(pageHeadingVariants({ size }), className)}>{children}</h2>
}

export default PageHeading
