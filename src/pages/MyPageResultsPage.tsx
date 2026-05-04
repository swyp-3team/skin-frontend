import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import type { ResultListItem, ResultListResponse } from '../api/types'
import { createResultDetailPath } from '../app/routes'
import PageHeader from '../components/headers/PageHeader'
import MobilePage from '../components/MobilePage'
import { toDateTimeDisplay } from '../lib/dateDisplay'
import { queryKeys } from '../lib/queryKeys'

const RESULT_LIST_PAGE_SIZE = 20

interface ResultHistoryCardProps {
  item: ResultListItem
}

function ResultHistoryCard({ item }: ResultHistoryCardProps) {
  const historyDateTime = toDateTimeDisplay(item.diagnosedAt)

  return (
    <li className="rounded-[8px] bg-common-0">
      <Link className="block px-3 py-3" to={createResultDetailPath(item.resultId)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm leading-[20.44px] text-neutral-600">
              <span>{historyDateTime.date}</span>
              <span className="text-neutral-300">{historyDateTime.time}</span>
            </div>
            <p className="text-xs leading-[16.32px] text-neutral-300">{item.title}</p>
          </div>
          <div className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-primary-400">
            <span>결과보기</span>
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </div>
        </div>
      </Link>
    </li>
  )
}

function MyPageResultsPage() {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<ResultListResponse, ApiError>({
    queryKey: queryKeys.resultListInfinite(),
    queryFn: ({ pageParam }) =>
      apiClient.getResultList({
        size: RESULT_LIST_PAGE_SIZE,
        cursor: typeof pageParam === 'number' && pageParam > 0 ? pageParam : undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined),
    retry: false,
  })

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

  const resultItems = data?.pages.flatMap((page) => page.results) ?? []

  return (
    <MobilePage header={<PageHeader backTo="/mypage" title="피부 진단 내역" />} mainClassName="bg-neutral-50 px-5 py-5">
      <section className="space-y-4 pb-8">
        {isLoading ? (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            진단 이력을 불러오는 중입니다.
          </p>
        ) : error ? (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            진단 이력을 불러오지 못했습니다.
          </p>
        ) : resultItems.length > 0 ? (
          <>
            <ul className="space-y-4">
              {resultItems.map((item) => (
                <ResultHistoryCard item={item} key={item.resultId} />
              ))}
            </ul>
            <div className="h-1 w-full" ref={sentinelRef} />
            {isFetchingNextPage ? (
              <p className="text-center text-sm text-neutral-400">진단 이력을 더 불러오는 중입니다.</p>
            ) : null}
          </>
        ) : (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            진단 이력이 없어요.
          </p>
        )}
      </section>
    </MobilePage>
  )
}

export default MyPageResultsPage
