import { MotionConfig, motion, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

import exclamationCircleWarningIcon from '../../assets/icons/product-detail/exclamation-circle-warning.svg'
import { cn } from '../../lib/utils'

const PRICE_INFO_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1]
const PRICE_INFO_OPEN_DURATION = 0.24
const PRICE_INFO_CLOSE_DURATION = 0.2
const PRICE_INFO_GAP = 12

const PANEL_VARIANTS = {
  open: { height: 'auto', opacity: 1, marginTop: PRICE_INFO_GAP },
  closed: { height: 0, opacity: 0, marginTop: 0 },
} as const

const CONTENT_VARIANTS = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -4 },
} as const

const CONTENT_VARIANTS_REDUCED = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
} as const

interface RecommendationNoticeProps {
  description: string
  title?: string
  className?: string
}

function RecommendationNotice({
  description,
  title = '추천 결과를 활용하기 전에 확인해 주세요.',
  className,
}: RecommendationNoticeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const panelId = useId()

  const openTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: PRICE_INFO_OPEN_DURATION, ease: PRICE_INFO_EASING }
  const closeTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: PRICE_INFO_CLOSE_DURATION, ease: PRICE_INFO_EASING }
  const transition = isOpen ? openTransition : closeTransition
  const contentVariants = shouldReduceMotion ? CONTENT_VARIANTS_REDUCED : CONTENT_VARIANTS

  return (
    <div className={cn('rounded-lg bg-neutral-50 p-3', className)}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? '추천 결과 안내 접기' : '추천 결과 안내 펼치기'}
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-1">
          <img alt="" aria-hidden className="size-5 shrink-0" src={exclamationCircleWarningIcon} />
          <span className="text-xs font-medium leading-[16.32px] text-neutral-600">{title}</span>
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-neutral-400 transition-transform duration-200', isOpen && 'rotate-180')}
          strokeWidth={1.1}
        />
      </button>

      <MotionConfig reducedMotion="user">
        <motion.section
          animate={isOpen ? 'open' : 'closed'}
          aria-hidden={!isOpen}
          className={isOpen ? 'overflow-hidden' : 'pointer-events-none overflow-hidden'}
          id={panelId}
          initial={false}
          transition={transition}
          variants={PANEL_VARIANTS}
        >
          <motion.p
            animate={isOpen ? 'open' : 'closed'}
            className="text-xs font-normal leading-[17.4px] text-neutral-600"
            initial={false}
            transition={transition}
            variants={contentVariants}
          >
            {description}
          </motion.p>
        </motion.section>
      </MotionConfig>
    </div>
  )
}

export default RecommendationNotice
