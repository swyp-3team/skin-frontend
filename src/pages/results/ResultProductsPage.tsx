import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { cn } from '../../lib/utils'
import { createProductDetailPath } from '../../app/routes'
import type { ResultProductItem } from '../../api/types'
import AlertMessage from '../../components/common/AlertMessage'
import SafeImage from '../../components/common/SafeImage'
import MobilePage from '../../components/MobilePage'
import ResultPageHeader from '../../components/results/ResultPageHeader'
import ResultTabBar from '../../components/results/ResultTabBar'
import ResultTopSection from '../../components/results/ResultTopSection'
import type { ResultProductTabId } from '../../components/results/types'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { isProductVisibleInTab, RESULT_PRODUCT_TABS, createResultHeaderViewModelFromSummary } from './resultViewModel'
import { useResultDetail } from './useResultDetail'
import { useResultProductsInfinite } from './useResultProductsInfinite'

const PRODUCTS_PAGE_COPY = {
  title: '제품 추천받기',
  intro: '진단 결과를 바탕으로\n제품을 골랐어요',
  searchPlaceholder: '브랜드, 제품명으로 검색해보세요',
} as const

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price)
}

interface ResultProductGridCardProps {
  product: ResultProductItem
}

function ResultProductGridCard({ product }: ResultProductGridCardProps) {
  return (
    <Link className="flex flex-col gap-3" to={createProductDetailPath(product.productId)}>
      <div className="overflow-hidden rounded bg-common-0">
        <SafeImage
          alt={product.name}
          className="aspect-square w-full object-cover"
          fallbackAlt={`${product.name} 이미지`}
          loading="lazy"
          src={product.imageUrl}
        />
      </div>

      <div className="space-y-2">
        <p className="line-clamp-2 text-[15px] font-medium leading-[22.2px] text-neutral-800">{product.name}</p>
        <div className="inline-flex items-baseline gap-1 text-neutral-800">
          <span className="text-[18px] font-bold leading-[25.56px]">{formatPrice(product.price)}</span>
          <span className="text-base font-medium leading-[23.68px]">원</span>
        </div>
      </div>
    </Link>
  )
}

function ResultProductsPage() {
  const { id } = useParams<{ id: string }>()
  const skinResultId = Number(id)
  const [activeTabId, setActiveTabId] = useState<ResultProductTabId>('ALL')
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { ref: whiteBoxSentinelRef, isCollapsed: isHeaderScrolled } = useScrollCollapse<HTMLDivElement>(
    '-49px 0px 0px 0px',
  )

  const { data: detail, isLoading: isDetailLoading, error: detailError } = useResultDetail()
  const {
    data: productsPages,
    isLoading: isProductsLoading,
    error: productsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useResultProductsInfinite(skinResultId)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }

    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    if (!isHeaderScrolled && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [isHeaderScrolled])

  if (!id || Number.isNaN(skinResultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          올바른 결과 ID가 아닙니다.
        </AlertMessage>
      </MobilePage>
    )
  }

  if (isDetailLoading || isProductsLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          추천 제품을 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (detailError || productsError || !detail || !productsPages) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {detailError?.message ?? productsError?.message ?? '추천 제품을 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const header = createResultHeaderViewModelFromSummary(detail.resultSummary)
  const allProducts = productsPages.pages.flatMap((page) => page.products)
  const visibleProducts = allProducts.filter((product) => isProductVisibleInTab(product.category, activeTabId))

  return (
    <MobilePage header={<ResultPageHeader isScrolled={isHeaderScrolled} title={PRODUCTS_PAGE_COPY.title} />}>
      <section className="space-y-0">
        <ResultTopSection header={header} intro={PRODUCTS_PAGE_COPY.intro} skinResultId={skinResultId} />
        <div ref={whiteBoxSentinelRef} aria-hidden className="h-px" />

        <div ref={containerRef} className={cn('-mx-4 sticky top-12 h-[calc(100dvh-48px)] bg-common-0', isHeaderScrolled ? 'overflow-y-auto' : 'overflow-hidden')}>
          <div className="sticky top-0 z-[9] space-y-5 bg-common-0 px-4 pt-5">
            <div className="inline-flex w-full items-center gap-2 rounded-lg border border-neutral-150 bg-neutral-50/50 px-3 py-3 text-sm leading-[20.44px] text-neutral-300">
              <span aria-hidden className="text-base">⌕</span>
              <span>{PRODUCTS_PAGE_COPY.searchPlaceholder}</span>
            </div>

            <ResultTabBar
              activeTabId={activeTabId}
              items={RESULT_PRODUCT_TABS}
              mode="scroll"
              onChange={(tabId) => setActiveTabId(tabId as ResultProductTabId)}
            />
          </div>

          <section className="mt-5 px-4 pb-10">
            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                {visibleProducts.map((product) => (
                  <ResultProductGridCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-neutral-400">표시할 제품이 없습니다.</p>
            )}

            <div className="h-1 w-full" ref={sentinelRef} />

            {isFetchingNextPage ? (
              <p className="pt-4 text-center text-sm text-neutral-400">제품을 더 불러오는 중입니다...</p>
            ) : null}
          </section>
        </div>
      </section>
    </MobilePage>
  )
}

export default ResultProductsPage
