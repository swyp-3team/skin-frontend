import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import PageHeader from './common/PageHeader'

interface MobilePageProps {
  children: ReactNode
  className?: string
  mainClassName?: string
  header?: ReactNode
  footer?: ReactNode
}

function MobilePage({
  children,
  className,
  mainClassName,
  header = <PageHeader showLogo className="bg-common-0" />,
  footer,
}: MobilePageProps) {
  return (
    <>
      <section
        data-mobile-shell
        className={cn(
          'relative mx-auto flex w-full min-h-[100dvh] max-w-[390px] flex-col shadow-[3px_0_30px_rgba(0,0,0,0.03),-3px_0_20px_rgba(0,0,0,0.01)]',
          className,
        )}
        style={{ overflowX: 'clip' }}
      >
        {header}
        <main className={cn('flex-1 px-4', mainClassName)}>
          {children}
        </main>
        {footer ? (
          <footer className="sticky bottom-0 w-full bg-white/70">
            {footer}
          </footer>
        ) : null}
      </section>
      <div
        data-mobile-portal
        className="pointer-events-none fixed top-0 z-20 h-[100dvh] w-full max-w-[390px] overflow-hidden"
        style={{ left: 'max(0px, calc((100vw - 390px) / 2))' }}
      />
    </>
  )
}

export default MobilePage
