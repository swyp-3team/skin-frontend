import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import type { RoutineListItem, RoutineListResponse } from '../api/types'
import { createRoutineDetailPath } from '../app/routes'
import PageHeader from '../components/headers/PageHeader'
import MobilePage from '../components/MobilePage'
import { toYearMonthDay } from '../lib/dateDisplay'
import { queryKeys } from '../lib/queryKeys'

const ROUTINE_LIST_PAGE_SIZE = 20

interface RoutineCardProps {
  item: RoutineListItem
}

function RoutineCard({ item }: RoutineCardProps) {
  return (
    <li className="rounded-[8px] bg-common-0 px-3 py-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-medium leading-[22.2px] text-neutral-900">{item.title}</p>
          <Link
            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-primary-400"
            to={createRoutineDetailPath(item.routineGroupId)}
          >
            <span>루틴보기</span>
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </Link>
        </div>
        <p className="text-[11px] font-medium leading-[14.3px] text-neutral-400">{toYearMonthDay(item.createdAt)}</p>
      </div>
    </li>
  )
}

function MyPageRoutinesPage() {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<RoutineListResponse, ApiError>({
    queryKey: queryKeys.routineListInfinite(),
    queryFn: ({ pageParam }) =>
      apiClient.getRoutineList({
        size: ROUTINE_LIST_PAGE_SIZE,
        cursor: typeof pageParam === 'number' && pageParam > 0 ? pageParam : undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined),
    staleTime: 0,
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

  const routineItems = data?.pages.flatMap((page) => page.routines) ?? []

  return (
    <MobilePage header={<PageHeader backTo="/mypage" title="나의 루틴" />} mainClassName="bg-neutral-50 px-5 py-5">
      <section className="space-y-4 pb-8">
        {isLoading ? (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            루틴 목록을 불러오는 중입니다.
          </p>
        ) : error ? (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            루틴 목록을 불러오지 못했습니다.
          </p>
        ) : routineItems.length > 0 ? (
          <>
            <ul className="space-y-4">
              {routineItems.map((item) => (
                <RoutineCard item={item} key={item.routineGroupId} />
              ))}
            </ul>
            <div className="h-1 w-full" ref={sentinelRef} />
            {isFetchingNextPage ? (
              <p className="text-center text-sm text-neutral-400">루틴 목록을 더 불러오는 중입니다.</p>
            ) : null}
          </>
        ) : (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            저장된 루틴이 없어요.
          </p>
        )}
      </section>
    </MobilePage>
  )
}

export default MyPageRoutinesPage
