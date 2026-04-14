import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import MobilePageHeading from './MobilePageHeading'

interface MobilePageProps {
  children: ReactNode
  className?: string
  headingLeft?: ReactNode
  headingCenter?: ReactNode
  headingRight?: ReactNode
  footer?: ReactNode
}

function MobilePage({ children, className, headingLeft, headingCenter, headingRight, footer }: MobilePageProps) {
  return (
    <section className={cn('mx-auto flex w-full min-h-[100dvh] max-w-[390px] flex-col bg-white px-4', className)}>
      <MobilePageHeading
        left={headingLeft}
        center={headingCenter}
        right={headingRight}
      />
      <main className='flex-1'>
        {children}
      </main>
      <footer className="sticky bottom-0 w-full bg-white">
        {footer}
      </footer>
    </section>
  )
}

export default MobilePage
