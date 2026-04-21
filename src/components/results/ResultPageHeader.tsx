import NavMenuDialog from '@/components/common/NavMenuDialog'

const ROOT_CLASS = 'sticky top-0 z-10 flex h-12 w-full items-center justify-between bg-primary-150  px-5 py-2'
const TITLE_CLASS = 'text-[20px] font-medium leading-[27.6px] text-neutral-800'

interface ResultPageHeaderProps {
  title: string
}

function ResultPageHeader({ title }: ResultPageHeaderProps) {
  return (
    <header className={ROOT_CLASS}>
      <h1 className={TITLE_CLASS}>{title}</h1>
      <NavMenuDialog />
    </header>
  )
}

export default ResultPageHeader
