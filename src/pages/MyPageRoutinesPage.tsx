import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import moreVerticalIcon from '../assets/icons/routine/more-vertical.svg'
import { createRoutineDetailPath } from '../app/routes'
import ConfirmActionDialog from '../components/common/ConfirmActionDialog'
import RoutineMoreBottomSheet from '../components/common/RoutineMoreBottomSheet'
import RoutineNameBottomSheet from '../components/common/RoutineNameBottomSheet'
import PageHeader from '../components/headers/PageHeader'
import MobilePage from '../components/MobilePage'
import { toYearMonthDay } from '../lib/dateDisplay'
import { notify } from '../lib/notify'
import { queryKeys } from '../lib/queryKeys'
import type { RoutineListItem, RoutineListResponse, UpdateRoutineResponse } from '../api/types'

const ROUTINE_LIST_PAGE_SIZE = 20

interface RoutineCardProps {
  item: RoutineListItem
  onOpenMore: (item: RoutineListItem) => void
  moreDisabled: boolean
}

function RoutineCard({ item, onOpenMore, moreDisabled }: RoutineCardProps) {
  return (
    <li className="rounded-[8px] bg-common-0">
      <Link className="block px-3 py-3" to={createRoutineDetailPath(item.routineGroupId)}>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-medium leading-[22.2px] text-black">{item.title}</p>
            <button
              aria-label={`${item.title} 더보기`}
              className="inline-flex items-center justify-center p-2 disabled:opacity-50"
              disabled={moreDisabled}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onOpenMore(item)
              }}
              type="button"
            >
              <img alt="" aria-hidden className="size-4" src={moreVerticalIcon} />
            </button>
          </div>
          <p className="text-[11px] font-medium leading-[14.3px] text-neutral-400">{toYearMonthDay(item.createdAt)}</p>
        </div>
      </Link>
    </li>
  )
}

function MyPageRoutinesPage() {
  const queryClient = useQueryClient()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineListItem | null>(null)
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [isRenameSheetOpen, setIsRenameSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  const deleteRoutineMutation = useMutation<void, ApiError, number>({
    mutationFn: (routineGroupId) => apiClient.deleteRoutine(routineGroupId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListInfinite() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListPreview() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myPage() }),
      ])
      setSelectedRoutine(null)
      notify.success('루틴이 삭제되었습니다.')
    },
    onError: (deleteError) => {
      notify.error(deleteError.message || '루틴 삭제에 실패했습니다.')
    },
  })
  const updateRoutineNameMutation = useMutation<UpdateRoutineResponse, ApiError, { routineGroupId: number; title: string }>({
    mutationFn: ({ routineGroupId, title }) =>
      apiClient.updateRoutineName(routineGroupId, { title }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListInfinite() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListPreview() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myPage() }),
      ])
    },
    onError: (updateError) => {
      notify.error(updateError.message || '루틴 이름 변경에 실패했습니다.')
    },
  })
  const isRoutineActionPending = deleteRoutineMutation.isPending || updateRoutineNameMutation.isPending

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

  function handleOpenMore(item: RoutineListItem) {
    if (isRoutineActionPending) {
      return
    }
    setSelectedRoutine(item)
    setIsMoreSheetOpen(true)
  }

  function handleEditClick() {
    if (!selectedRoutine || isRoutineActionPending) {
      return
    }
    setIsMoreSheetOpen(false)
    setIsRenameSheetOpen(true)
  }

  async function handleRenameSubmit(nextRoutineName: string) {
    if (!selectedRoutine || isRoutineActionPending) {
      return
    }

    try {
      const updated = await updateRoutineNameMutation.mutateAsync({
        routineGroupId: selectedRoutine.routineGroupId,
        title: nextRoutineName,
      })
      setSelectedRoutine((prev) => (prev ? { ...prev, title: updated.title } : prev))
      setIsRenameSheetOpen(false)
    } catch {
      // onError에서 사용자 메시지를 처리하므로 여기서는 추가 처리하지 않습니다.
    }
  }

  function handleDeleteClick() {
    if (!selectedRoutine || isRoutineActionPending) {
      return
    }
    setIsMoreSheetOpen(false)
    setIsDeleteDialogOpen(true)
  }

  function handleDeleteConfirm() {
    if (!selectedRoutine || isRoutineActionPending) {
      return
    }
    setIsDeleteDialogOpen(false)
    deleteRoutineMutation.mutate(selectedRoutine.routineGroupId)
  }

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
                <RoutineCard
                  item={item}
                  key={item.routineGroupId}
                  moreDisabled={isRoutineActionPending}
                  onOpenMore={handleOpenMore}
                />
              ))}
            </ul>
            <div className="h-1 w-full" ref={sentinelRef} />
            {isFetchingNextPage ? (
              <p className="text-center text-sm text-neutral-400">루틴 목록을 더 불러오는 중입니다.</p>
            ) : null}
          </>
        ) : (
          <p className="rounded-lg border border-neutral-150 bg-common-0 px-3 py-6 text-center text-sm text-neutral-400">
            저장한 루틴이 없어요.
          </p>
        )}
      </section>

      <RoutineMoreBottomSheet
        actionDisabled={isRoutineActionPending}
        onDelete={handleDeleteClick}
        onEdit={handleEditClick}
        onOpenChange={setIsMoreSheetOpen}
        open={isMoreSheetOpen}
      />

      <RoutineNameBottomSheet
        closeAriaLabel="루틴 이름 변경 시트 닫기"
        initialValue={selectedRoutine?.title ?? ''}
        isSubmitting={updateRoutineNameMutation.isPending}
        onOpenChange={setIsRenameSheetOpen}
        onSubmit={handleRenameSubmit}
        open={isRenameSheetOpen}
        requireChanged
        title="루틴 이름 변경"
      />

      <ConfirmActionDialog
        confirmDisabled={isRoutineActionPending}
        confirmLabel={deleteRoutineMutation.isPending ? '삭제 중...' : '확인'}
        description="삭제된 루틴은 복구할 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        title="루틴을 삭제하시겠습니까?"
      />
    </MobilePage>
  )
}

export default MyPageRoutinesPage
