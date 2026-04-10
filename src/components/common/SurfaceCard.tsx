import type { HTMLAttributes, ReactNode } from 'react'

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function SurfaceCard({ children, className, ...props }: SurfaceCardProps) {
  return (
    <div className={joinClassNames('rounded-[12px] bg-card-bg p-4', className)} {...props}>
      {children}
    </div>
  )
}

export default SurfaceCard
