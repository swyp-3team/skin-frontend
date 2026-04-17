import { useState } from 'react'
import { MotionConfig, motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import closeBlackIcon from '../assets/icons/product-detail/close-black.svg'
import exclamationCircleIcon from '../assets/icons/product-detail/exclamation-circle.svg'
import AlertMessage from '../components/common/AlertMessage'
import SafeImage from '../components/common/SafeImage'
import GlassOverlayHeader from '../components/mobile-page/GlassOverlayHeader'
import MobilePage from '../components/MobilePage'
import { Button } from '../components/ui/button'
import { useProductDetail } from './product/useProductDetail'

const PRICE_INFO_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1]
const PRICE_INFO_OPEN_DURATION = 0.24
const PRICE_INFO_CLOSE_DURATION = 0.2
const PRICE_INFO_GAP = 12
const PRICE_INFO_PANEL_CLASS = 'w-[303px] overflow-hidden rounded-[4px] border border-neutral-300 bg-common-0'
const PRICE_INFO_PANEL_VARIANTS = {
  open: { height: 'auto', opacity: 1, marginTop: PRICE_INFO_GAP },
  closed: { height: 0, opacity: 0, marginTop: 0 },
} as const
const PRICE_INFO_CONTENT_VARIANTS = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -4 },
} as const
const PRICE_INFO_CONTENT_VARIANTS_REDUCED = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
} as const

function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

function formatPriceAsOf(value: string) {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

interface PriceInfoPanelProps {
  isOpen: boolean
  panelId: string
  formattedPriceDate: string
  onClose: () => void
}

function PriceInfoPanel({ isOpen, panelId, formattedPriceDate, onClose }: PriceInfoPanelProps) {
  const shouldReduceMotion = useReducedMotion()
  const openTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: PRICE_INFO_OPEN_DURATION, ease: PRICE_INFO_EASING }
  const closeTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: PRICE_INFO_CLOSE_DURATION, ease: PRICE_INFO_EASING }
  const transition = isOpen ? openTransition : closeTransition
  const contentVariants = shouldReduceMotion
    ? PRICE_INFO_CONTENT_VARIANTS_REDUCED
    : PRICE_INFO_CONTENT_VARIANTS

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        animate={isOpen ? 'open' : 'closed'}
        aria-hidden={!isOpen}
        className={`${PRICE_INFO_PANEL_CLASS}${isOpen ? '' : ' pointer-events-none'}`}
        id={panelId}
        initial={false}
        transition={transition}
        variants={PRICE_INFO_PANEL_VARIANTS}
      >
        <motion.div
          animate={isOpen ? 'open' : 'closed'}
          initial={false}
          transition={transition}
          variants={contentVariants}
        >
          <div className="flex items-center justify-between p-2">
            <div className="px-2">
              <p className="text-sm font-semibold leading-[20.44px] text-[#000000]">가격 안내</p>
            </div>
            <button
              aria-label="가격 안내 닫기"
              className="inline-flex items-center justify-center p-2"
              onClick={onClose}
              type="button"
            >
              <img alt="" aria-hidden className="h-5 w-5" src={closeBlackIcon} />
            </button>
          </div>
          <div className="px-4 pb-4 pt-1">
            <p className="text-xs leading-[16.32px] text-[#000000]">
              {formattedPriceDate} 기준 가격입니다. 링크 연결 시 가격이 변동될 수 있습니다.
            </p>
          </div>
        </motion.div>
      </motion.section>
    </MotionConfig>
  )
}

function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId, data: product, isLoading, error } = useProductDetail()
  const [isPriceInfoOpen, setIsPriceInfoOpen] = useState(false)

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          상품 정보를 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !product) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? `상품 정보를 찾을 수 없습니다. (ID: ${Number.isFinite(productId) ? productId : '-'})`}
        </AlertMessage>
      </MobilePage>
    )
  }

  const formattedPriceDate = formatPriceAsOf(product.priceAsOf)
  const priceInfoPanelId = `price-info-panel-${product.productId}`

  return (
    <MobilePage
      header={<GlassOverlayHeader onBack={() => navigate(-1)} onClose={() => navigate(APP_ROUTES.home)}/>}
      mainClassName="-mt-12 overflow-x-hidden p-0"
      footer={
        <div className='relative'>
          <div className='pointer-events-none absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-black/12 from-0% via-black/6 via-35% to-transparent to-100%'/>
          <div className="border-t border-neutral-50 bg-common-0 px-5 py-5">
            <Button
              className="h-auto w-full rounded-lg px-6 py-3 text-base font-medium leading-[23.68px]"
              onClick={() => window.open(product.purchaseUrl, '_blank', 'noopener,noreferrer')}
              type="button"
              variant="dark"
            >
              올리브영에서 확인하기
            </Button>
          </div>
        </div>
      }
    >
      <section className="relative isolate bg-neutral-0 pb-24">
          <div className="relative isolate z-0 h-[470px] overflow-hidden">
            <SafeImage
              alt={product.name}
              className="relative z-10 h-[390px] w-full object-cover"
              fallbackAlt={`${product.name} image unavailable`}
              loading="eager"
              src={product.imageUrl}
            />
            <div className="absolute inset-x-0 bottom-0 z-0 h-[80px] overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-[2px] origin-bottom scale-y-[40] overflow-hidden">
                <SafeImage
                  alt=""
                  className="absolute bottom-0 left-0 h-[390px] w-full object-cover"
                  fallbackAlt=""
                  loading="eager"
                  src={product.imageUrl}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-common-0/20 via-[35%] to-common-0" />
            </div>

          </div>
        <div className="relative z-10 -mt-[80px] px-5">
          <article className="rounded-t-2xl bg-common-0">
            <div className="flex flex-col gap-2">
              <div className="relative space-y-4 px-4 py-5">
                <p className="text-sm leading-[20.44px] text-neutral-800">{product.brandName}</p>
                <h2 className="text-[20px] leading-[27.6px] text-neutral-800">{product.name}</h2>

                <div className="space-y-0">
                  <div className="flex items-center gap-1">
                    <div className="flex items-end gap-0.5">
                      <strong className="text-[22px] leading-[29.7px] text-neutral-800">{formatPrice(product.price)}</strong>
                      <span className="text-[18px] leading-[25.56px] text-neutral-800">원</span>
                    </div>
                    <button
                      aria-controls={priceInfoPanelId}
                      aria-expanded={isPriceInfoOpen}
                      aria-label="가격 안내 보기"
                      className="inline-flex h-5 w-5 items-center justify-center overflow-hidden"
                      onClick={() => setIsPriceInfoOpen((prev) => !prev)}
                      type="button"
                    >
                      <img alt="" aria-hidden className="h-5 w-5" src={exclamationCircleIcon} />
                    </button>
                  </div>

                  <PriceInfoPanel
                    formattedPriceDate={formattedPriceDate}
                    isOpen={isPriceInfoOpen}
                    onClose={() => setIsPriceInfoOpen(false)}
                    panelId={priceInfoPanelId}
                  />
                </div>
              </div>

              <div className="space-y-4 px-4 py-5">
                <h3 className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  레이어드가 알려드리는
                  <br />
                  제품 특징
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  {product.featureTags.map((tag) => (
                    <span
                      className="inline-flex items-center rounded bg-primary-50 px-2 py-1 text-sm font-semibold leading-[20.44px] text-primary-500"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="py-5 text-base leading-[23.68px] text-neutral-800">{product.description}</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </MobilePage>
  )
}

export default ProductDetailPage
