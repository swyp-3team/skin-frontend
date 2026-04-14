import type { ReactNode } from 'react'

import MobilePageHeading from './MobilePageHeading'

interface MobilePageProps {
  children: ReactNode
  headingLeft?: ReactNode
  headingCenter?: ReactNode
  headingRight?: ReactNode
}

function MobilePage({ children, headingLeft, headingCenter, headingRight }: MobilePageProps) {
  return (
    <section className="mx-auto w-full min-h-dvh max-w-[390px] bg-white pb-20 px-4">
      <MobilePageHeading
        left={headingLeft}
        center={headingCenter}
        right={headingRight}
      />
      <main>
        {children}
      </main>
    </section>
  )
}

export default MobilePage
