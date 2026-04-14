import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import MobilePageHeading from './MobilePageHeading'

interface MobilePageProps {
  children: ReactNode
  headingClassName?: string
  className?: string
  headingLeft?: ReactNode
  headingCenter?: ReactNode
  headingRight?: ReactNode
  footer?: ReactNode
}

function MobilePage({ children, headingClassName, className, headingLeft, headingCenter, headingRight, footer }: MobilePageProps) {
  return (
    <section className={cn('mx-auto flex w-full min-h-[100dvh] max-w-[390px] flex-col shadow-[3px_0_30px_rgba(0,0,0,0.03),-3px_0_20px_rgba(0,0,0,0.01)]', className)}>
      <MobilePageHeading
        left={headingLeft}
        center={headingCenter}
        right={headingRight}
        className={cn('sticky top-0', headingClassName)}
      />
      <main className='flex-1 px-4'>
        {children}
      </main>
      <footer className="sticky bottom-0 w-full bg-white">
        {footer}
      </footer>
    </section>
  )
}

export default MobilePage
