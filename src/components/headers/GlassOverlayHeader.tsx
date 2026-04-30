import glassChevronLeftIcon from '../../assets/icons/mobile-page/glass-chevron-left.svg'
import glassCloseIcon from '../../assets/icons/mobile-page/glass-close.svg'

const ROOT = 'sticky top-0 z-20 w-full h-12 px-5 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center bg-transparent'
const GLASS_BTN = 'rounded-full backdrop-blur-[2px] inline-flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80'

interface GlassOverlayHeaderProps {
  onBack: () => void
  onClose: () => void
  title?: string
}

function GlassOverlayHeader({ onBack, onClose, title }: GlassOverlayHeaderProps) {
  return (
    <header className={ROOT}>
      <div className="flex items-center">
        <button type="button" aria-label="뒤로 가기" className={GLASS_BTN} onClick={onBack}>
          <img alt="" aria-hidden className="h-8 w-8" src={glassChevronLeftIcon} />
        </button>
      </div>
      <div className="flex items-center justify-center text-[18px] font-medium leading-[25.56px] text-neutral-800">
        {title}
      </div>
      <div className="flex items-center justify-end">
        <button type="button" aria-label="닫기" className={GLASS_BTN} onClick={onClose}>
          <img alt="" aria-hidden className="h-8 w-8" src={glassCloseIcon} />
        </button>
      </div>
    </header>
  )
}

export default GlassOverlayHeader
