import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import searchIcon from '../../assets/icons/mobile-page/search.svg'
import { createProductDetailPath, createResultProductsSearchPath } from '../../app/routes'
import type { ResultProductItem } from '../../api/types'
import AlertMessage from '../../components/common/AlertMessage'
import SafeImage from '../../components/common/SafeImage'
import MobilePage from '../../components/MobilePage'
import PageHeader from '../../components/common/PageHeader'
import ResultTopSection from '../../components/results/ResultTopSection'
import type { ResultProductTabId } from '../../components/results/types'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { cn } from '../../lib/utils'
import { RESULT_PRODUCT_TABS } from './resultViewModel'
import { useProfileHeader } from './useResultDetail'
import { useResultProductsInfinite } from './useResultProductsInfinite'

const PRODUCTS_PAGE_COPY = {
  title: '제품 추천받기',
  intro: '진단 결과를 바탕으로 제품을 골랐어요',
  searchPlaceholder: '브랜드, 제품명으로 검색해보세요',
} as const

interface ProductsPageScrollSnapshot {
  scrollTop: number
  tabId: ResultProductTabId
  windowScrollY: number
  isHeaderScrolled: boolean
}

const productsPageScrollSnapshots = new Map<number, ProductsPageScrollSnapshot>()

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price)
}

function isValidResultId(resultId: number): boolean {
  return Number.isFinite(resultId) && resultId > 0
}

interface ResultProductGridCardProps {
  from: string
  onOpenProduct: () => void
  product: ResultProductItem
}

function ResultProductGridCard({ from, onOpenProduct, product }: ResultProductGridCardProps) {
  return (
    <Link className="flex flex-col gap-3" onClick={onOpenProduct} state={{ from }} to={createProductDetailPath(product.productId)}>
      <div className="overflow-hidden rounded h-full w-full bg-common-0">
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
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const resultId = Number(id)
  const savedSnapshot = Number.isFinite(resultId) ? productsPageScrollSnapshots.get(resultId) : undefined
  const initialHeaderScrolled = savedSnapshot?.isHeaderScrolled ?? false
  const [activeTabId, setActiveTabId] = useState<ResultProductTabId>(savedSnapshot?.tabId ?? 'ALL')
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const didRestoreScrollRef = useRef(false)
  const { ref: whiteBoxSentinelRef, isCollapsed: isHeaderScrolled } = useScrollCollapse<HTMLDivElement>(
    '-49px 0px 0px 0px',
    initialHeaderScrolled,
  )

  const { data: header, isLoading: isHeaderLoading, error: headerError } = useProfileHeader(resultId)
  const {
    data: productsPages,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    error: productsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useResultProductsInfinite(resultId, activeTabId)

  const saveScrollSnapshot = useCallback(() => {
    if (!isValidResultId(resultId)) {
      return
    }

    productsPageScrollSnapshots.set(resultId, {
      scrollTop: containerRef.current?.scrollTop ?? 0,
      tabId: activeTabId,
      windowScrollY: window.scrollY,
      isHeaderScrolled,
    })
  }, [activeTabId, isHeaderScrolled, resultId])

  const handleSearchClick = useCallback(() => {
    if (!isValidResultId(resultId)) {
      return
    }

    saveScrollSnapshot()
    navigate(createResultProductsSearchPath(resultId))
  }, [navigate, resultId, saveScrollSnapshot])

  useLayoutEffect(() => {
    if (didRestoreScrollRef.current || !productsPages) {
      return
    }

    const snapshot = productsPageScrollSnapshots.get(resultId)
    if (!snapshot || snapshot.tabId !== activeTabId) {
      didRestoreScrollRef.current = true
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    window.scrollTo(0, snapshot.windowScrollY)
    container.scrollTop = snapshot.scrollTop
    requestAnimationFrame(() => {
      window.scrollTo(0, snapshot.windowScrollY)
      container.scrollTop = snapshot.scrollTop
    })
    productsPageScrollSnapshots.delete(resultId)
    didRestoreScrollRef.current = true
  }, [activeTabId, productsPages, resultId])

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

  if (!id || Number.isNaN(resultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          올바른 결과 ID가 아닙니다.
        </AlertMessage>
      </MobilePage>
    )
  }

  if (isHeaderLoading || isProductsLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          추천 제품을 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (headerError || productsError || !header || !productsPages) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {headerError?.message ?? productsError?.message ?? '추천 제품을 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const allProducts = productsPages.pages.flatMap((page) => page.products)
  const isTabSwitching = isProductsFetching && !isFetchingNextPage

  return (
    <MobilePage
      header={
        <PageHeader
          actionSlot={
            <button
              type="button"
              aria-label="제품 검색 페이지 열기"
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center overflow-hidden transition-transform duration-300',
                isHeaderScrolled
                  ? 'pointer-events-auto translate-y-0'
                  : 'pointer-events-none -translate-y-10',
              )}
              onClick={handleSearchClick}
            >
              <img alt="" aria-hidden className="size-7" src={searchIcon} />
            </button>
          }
          isScrolled={isHeaderScrolled}
          title={PRODUCTS_PAGE_COPY.title}
        />
      }
    >
      <section className="space-y-0">
        <ResultTopSection
          header={header}
          intro={PRODUCTS_PAGE_COPY.intro}
          resultId={resultId}
          initialCollapsed={initialHeaderScrolled}
        />
        <div ref={whiteBoxSentinelRef} aria-hidden className="h-px" />

        <div
          ref={containerRef}
          className={cn(
            '-mx-4 sticky top-12 h-[calc(100dvh-48px)] bg-common-0 hide-scrollbar',
            isHeaderScrolled ? 'overflow-y-auto' : 'overflow-hidden',
          )}
        >
          <div className="sticky top-0 z-9 bg-gradient-to-b from-common-0 from-40% to-common-0/70 px-4 pt-4 pb-3">
            <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex', flexWrap: 'wrap', alignContent: 'flex-start'}}>
              {RESULT_PRODUCT_TABS.map((tab) => {
                const isActive = activeTabId === tab.id
                return (
                  <div
                    key={tab.id}
                    data-property-1={isActive ? 'on' : 'off'}
                    onClick={() => setActiveTabId(tab.id as ResultProductTabId)}
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      paddingLeft: 8,
                      paddingRight: 8,
                      paddingTop: 6,
                      paddingBottom: 6,
                      height: 31,
                      background: isActive ? 'var(--Neutral-800, #1A1C18)' : 'var(--Common-0, white)',
                      borderRadius: 8,
                      outline: isActive ? undefined : '1px var(--Neutral-150, #E0E2E0) solid',
                      outlineOffset: isActive ? undefined : '-1px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      display: 'flex',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{textAlign: 'center', color: isActive ? 'var(--Common-0, white)' : 'var(--Neutral-300, #A4AAA6)', fontSize: 14, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '20.44px', wordWrap: 'break-word'}}>
                      {tab.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <section className={cn('w-full mt-5 px-5 pb-10 transition-opacity duration-150', isTabSwitching && 'opacity-40')}>
            {allProducts.length > 0 ? (
              <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6">
                {allProducts.map((product) => (
                  <ResultProductGridCard
                    key={product.productId}
                    from={location.pathname + location.search + location.hash}
                    onOpenProduct={saveScrollSnapshot}
                    product={product}
                  />
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
