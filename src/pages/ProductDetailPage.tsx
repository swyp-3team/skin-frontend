import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import SafeImage from '../components/common/SafeImage'
import GlassOverlayHeader from '../components/mobile-page/GlassOverlayHeader'
import MobilePage from '../components/MobilePage'
import { Button } from '../components/ui/button'
import { useProductDetail } from './product/useProductDetail'

function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId, data: product, isLoading, error } = useProductDetail()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

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
        <div className="relative isolate z-0 h-[540px] overflow-hidden">
          <SafeImage
            alt={product.name}
            className="relative z-10 h-[390px] w-full object-cover"
            fallbackAlt={`${product.name} image unavailable`}
            loading="eager"
            src={product.imageUrl}
          />
          <div className="absolute inset-x-0 bottom-0 z-0 h-[150px] overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-[3px] origin-bottom scale-y-[51] overflow-hidden">
              <SafeImage
                alt=""
                className="absolute bottom-0 left-0 h-[390px] w-full object-cover"
                fallbackAlt=""
                loading="eager"
                src={product.imageUrl}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-common-0/20 via-[15%] to-common-0 to-[70%]" />
          </div>
        </div>

        <div className="relative z-10 -mt-[150px] px-5">
          <article className="rounded-t-2xl bg-common-0">
            <div className="flex flex-col gap-2">
              <div className="relative space-y-4 px-4 py-5">
                <p className="text-sm leading-[20.44px] text-neutral-800">{product.brand}</p>
                <h2 className="text-[20px] leading-[27.6px] text-neutral-800">{product.name}</h2>

                <div className="flex items-end gap-0.5">
                  <strong className="text-[22px] leading-[29.7px] text-neutral-800">-</strong>
                </div>
              </div>

              <div className="space-y-4 px-4 py-5">
                <h2 className="text-[24px] font-bold leading-[32.4px] text-neutral-800">레이어드가 알려드리는<br /> 제품 특징</h2>
                <p className="py-5 text-base leading-[23.68px] text-neutral-800">{product.description || '.'}</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </MobilePage>
  )
}

export default ProductDetailPage
