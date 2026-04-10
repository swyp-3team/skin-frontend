import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface PillCtaLinkProps {
  children: ReactNode
  to: string
  className?: string
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function PillCtaLink({ children, to, className }: PillCtaLinkProps) {
  return (
    <Link className={joinClassNames('inline-flex rounded-[999px] bg-cta font-semibold text-white', className)} to={to}>
      {children}
    </Link>
  )
}

export default PillCtaLink
