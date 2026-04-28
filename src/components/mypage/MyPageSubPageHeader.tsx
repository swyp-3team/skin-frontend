import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { APP_ROUTES } from '../../app/routes'

interface MyPageSubPageHeaderProps {
  title: string
}

function MyPageSubPageHeader({ title }: MyPageSubPageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 grid h-12 w-full grid-cols-[28px_1fr_28px] items-center bg-common-0 px-5 py-2.5">
      <Link
        aria-label="마이페이지로 이동"
        className="inline-flex size-7 items-center justify-start text-neutral-800"
        to={APP_ROUTES.myPage}
      >
        <ChevronLeft className="size-5" strokeWidth={1.8} />
      </Link>
      <h1 className="text-center text-[18px] font-medium leading-[25.56px] text-neutral-800">{title}</h1>
      <span aria-hidden className="size-7" />
    </header>
  )
}

export default MyPageSubPageHeader
