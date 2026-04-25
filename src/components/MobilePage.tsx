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
    <section
      className={cn(
        'relative mx-auto flex w-full min-h-[100dvh] max-w-[390px] flex-col shadow-[3px_0_30px_rgba(0,0,0,0.03),-3px_0_20px_rgba(0,0,0,0.01)]',
        className,
      )}
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
  )
}

export default MobilePage
