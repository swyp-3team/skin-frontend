import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronLeft, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { apiClient } from '@/api'
import { ApiError } from '@/api/errors'
import type { ProductSearchPageData, ResultProductItem } from '@/api/types'
import { createProductDetailPath, createResultProductsPath } from '@/app/routes'
import AlertMessage from '@/components/common/AlertMessage'
import NavMenuDialog from '@/components/common/NavMenuDialog'
import SafeImage from '@/components/common/SafeImage'
import MobilePage from '@/components/MobilePage'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

const SEARCH_PAGE_COPY = {
  title: '제품 검색',
  placeholder: '브랜드, 제품명으로 검색해보세요',
  searching: '검색 중입니다...',
  emptyTitle: '아직 등록된 제품이 없어요.',
  emptyDescriptionTop: '더 많은 제품을 준비하고 있어요.',
  emptyDescriptionBottom: '조금만 기다려 주세요.',
} as const

const SEARCH_PAGE_SIZE = 20

function isValidResultId(resultId: number): boolean {
  return Number.isFinite(resultId) && resultId > 0
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price)
}

interface SearchHeaderProps {
  onBack: () => void
}

function SearchHeader({ onBack }: SearchHeaderProps) {
  return (
    <header className="sticky top-0 z-10 grid h-12 w-full grid-cols-[28px_1fr_28px] items-center bg-common-0 px-5 py-2">
      <button
        aria-label="추천 제품 페이지로 돌아가기"
        className="inline-flex size-7 items-center justify-center rounded"
        type="button"
        onClick={onBack}
      >
        <ChevronLeft className="text-neutral-800" size={28} strokeWidth={1.9} />
      </button>

      <h1 className="text-center text-[18px] font-medium leading-[25.56px] text-neutral-800">
        {SEARCH_PAGE_COPY.title}
      </h1>

      <div className="flex justify-end">
        <NavMenuDialog />
      </div>
    </header>
  )
}

interface SearchResultCardProps {
  product: ResultProductItem
}

function SearchResultCard({ product }: SearchResultCardProps) {
  return (
    <Link className="flex flex-col gap-3" to={createProductDetailPath(product.productId)}>
      <div className="aspect-square w-full overflow-hidden rounded-[4px] bg-common-0">
        <SafeImage
          alt={product.name}
          className="h-full w-full object-cover"
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

function ResultProductsSearchPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const resultId = Number(id)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const [inputKeyword, setInputKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  const normalizedSubmittedKeyword = submittedKeyword.trim()
  const hasSubmittedKeyword = normalizedSubmittedKeyword.length > 0

  const {
    data: searchPages,
    isLoading: isSearchLoading,
    error: searchError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<ProductSearchPageData, ApiError>({
    queryKey: queryKeys.resultProductsSearchSource(resultId, normalizedSubmittedKeyword),
    queryFn: ({ pageParam }) =>
      apiClient.searchProducts({
        keyword: normalizedSubmittedKeyword,
        size: SEARCH_PAGE_SIZE,
        cursor: typeof pageParam === 'number' ? pageParam : 0,
      }),
    enabled: isValidResultId(resultId) && hasSubmittedKeyword,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined),
    retry: false,
  })

  const searchedProducts = useMemo(
    () => searchPages?.pages.flatMap((page) => page.products) ?? [],
    [searchPages],
  )

  const handleSubmitSearch = useCallback(() => {
    const nextKeyword = inputKeyword.trim()
    setSubmittedKeyword(nextKeyword)
  }, [inputKeyword])

  useEffect(() => {
    const focusInput = () => {
      const input = inputRef.current
      if (!input) {
        return
      }

      input.focus({ preventScroll: true })
      input.setSelectionRange(input.value.length, input.value.length)
    }

    const timeoutId = window.setTimeout(() => {
      focusInput()
      window.requestAnimationFrame(focusInput)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!hasSubmittedKeyword || !hasNextPage || isFetchingNextPage) {
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
      { rootMargin: '120px 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasSubmittedKeyword, hasNextPage, isFetchingNextPage])

  const handleBack = useCallback(() => {
    if (!isValidResultId(resultId)) {
      navigate(-1)
      return
    }

    navigate(createResultProductsPath(resultId))
  }, [navigate, resultId])

  if (!id || !isValidResultId(resultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          올바른 결과 ID가 아닙니다.
        </AlertMessage>
      </MobilePage>
    )
  }

  const showResults = hasSubmittedKeyword && searchedProducts.length > 0
  const showEmptyState = hasSubmittedKeyword && !isSearchLoading && !searchError && searchedProducts.length === 0
  const showLoading = hasSubmittedKeyword && isSearchLoading && !searchError
  const isInputFocusStyle = isInputFocused

  return (
    <MobilePage
      className="bg-neutral-0"
      header={<SearchHeader onBack={handleBack} />}
      mainClassName="min-h-0 flex flex-col bg-neutral-0 px-0"
    >
      <section className="sticky top-12 z-9 border-b border-neutral-200 bg-neutral-0 px-5 py-5">
        <div
          className={cn(
            'inline-flex w-full items-center gap-2.5 rounded-lg border bg-common-0 p-2.5',
            isInputFocusStyle ? 'border-primary-300' : 'border-neutral-150',
          )}
        >
          <input
            ref={inputRef}
            autoComplete="off"
            autoFocus
            className="no-search-cancel h-[18px] flex-1 bg-transparent px-1 text-[13px] leading-[18.2px] text-neutral-800 placeholder:text-neutral-200 focus:outline-none"
            enterKeyHint="search"
            placeholder={SEARCH_PAGE_COPY.placeholder}
            type="search"
            value={inputKeyword}
            onBlur={() => setIsInputFocused(false)}
            onChange={(event) => setInputKeyword(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') {
                return
              }

              event.preventDefault()
              handleSubmitSearch()
            }}
          />

          <button
            aria-label="검색 실행"
            className="inline-flex size-5 shrink-0 items-center justify-center text-neutral-200"
            type="button"
            onClick={handleSubmitSearch}
          >
            <Search aria-hidden className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </section>

      {searchError ? (
        <section className="px-5 py-6">
          <AlertMessage size="md" variant="error">
            {searchError.message}
          </AlertMessage>
        </section>
      ) : null}

      {showLoading ? (
        <section className="px-5 py-6 pt-30">
          <p className="text-center text-sm text-neutral-400">{SEARCH_PAGE_COPY.searching}</p>
        </section>
      ) : null}

      {showResults ? (
        <section className="px-5 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {searchedProducts.map((product) => (
              <SearchResultCard key={product.productId} product={product} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-px w-full" />
        </section>
      ) : null}

      {showEmptyState ? (
        <section className="flex flex-1 flex-col items-center px-5 pt-30 text-center">
          <p className="text-[20px] font-medium leading-[29px] text-neutral-800">{SEARCH_PAGE_COPY.emptyTitle}</p>
          <p className="mt-1 text-base font-normal leading-[23.68px] text-neutral-800">
            {SEARCH_PAGE_COPY.emptyDescriptionTop}
          </p>
          <p className="text-base font-normal leading-[23.68px] text-neutral-800">
            {SEARCH_PAGE_COPY.emptyDescriptionBottom}
          </p>
        </section>
      ) : null}
    </MobilePage>
  )
}

export default ResultProductsSearchPage
