import CloseButton from '@/components/common/CloseButton'

const ROOT = 'sticky top-0 z-10 w-full h-12 px-5 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center bg-common-0'

interface TitleCloseHeaderProps {
  title: string
  onClose: () => void
}

function TitleCloseHeader({ title, onClose }: TitleCloseHeaderProps) {
  return (
    <header className={ROOT}>
      <span aria-hidden className="size-7 shrink-0" />
      <div className="flex items-center justify-center text-base font-medium text-neutral-800">
        {title}
      </div>
      <div className="flex items-center justify-end">
        <CloseButton onClick={onClose} aria-label="닫기" />
      </div>
    </header>
  )
}

export default TitleCloseHeader
