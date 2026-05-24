import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import moreVerticalDetailIcon from '../assets/icons/routine/more-vertical-detail.svg'
import { APP_ROUTES } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import ConfirmActionDialog from '../components/common/ConfirmActionDialog'
import RoutineMoreBottomSheet from '../components/common/RoutineMoreBottomSheet'
import RoutineNameBottomSheet from '../components/common/RoutineNameBottomSheet'
import RoutineStepCard from '../components/common/RoutineStepCard'
import MobilePage from '../components/MobilePage'
import PageHeader from '../components/headers/PageHeader'
import { notify } from '../lib/notify'
import { queryKeys } from '../lib/queryKeys'
import { cn } from '../lib/utils'
import type { UpdateRoutineResponse } from '../api/types'

type RoutineTabId = 'am' | 'pm'

const ROUTINE_TAB_ITEMS: { id: RoutineTabId; label: string }[] = [
  { id: 'am', label: '아침 루틴' },
  { id: 'pm', label: '저녁 루틴' },
]

function isValidRoutineGroupId(routineGroupId: number) {
  return Number.isFinite(routineGroupId) && routineGroupId > 0
}

function getRoutineTabFromSearchParams(searchParams: URLSearchParams): RoutineTabId {
  const tab = searchParams.get('tab')
  return tab === 'pm' ? 'pm' : 'am'
}

function RoutineDetailPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { id } = useParams<{ id: string }>()
  const routineGroupId = Number(id)
  const activeTabId = getRoutineTabFromSearchParams(searchParams)
  const [slideDirection, setSlideDirection] = useState(0)
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [isRenameSheetOpen, setIsRenameSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isValidId = isValidRoutineGroupId(routineGroupId)

  useEffect(() => {
    document.documentElement.classList.add('routine-detail-no-scroll')
    document.body.classList.add('routine-detail-no-scroll')

    return () => {
      document.documentElement.classList.remove('routine-detail-no-scroll')
      document.body.classList.remove('routine-detail-no-scroll')
    }
  }, [])

  const {
    data: routineDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.routineDetail(routineGroupId),
    queryFn: () => apiClient.getRoutineDetail(routineGroupId),
    enabled: isValidId,
    retry: false,
  })

  const deleteRoutineMutation = useMutation<void, ApiError, number>({
    mutationFn: (targetId) => apiClient.deleteRoutine(targetId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListInfinite() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListPreview() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.routineDetail(routineGroupId) }),
      ])
      navigate(APP_ROUTES.myPageRoutines, { replace: true })
    },
    onError: (deleteError) => {
      notify.error(deleteError.message || '루틴 삭제에 실패했습니다.')
    },
  })
  const updateRoutineNameMutation = useMutation<UpdateRoutineResponse, ApiError, { routineGroupId: number; title: string }>({
    mutationFn: ({ routineGroupId: targetRoutineGroupId, title }) =>
      apiClient.updateRoutineName(targetRoutineGroupId, { title }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.routineDetail(routineGroupId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListInfinite() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.routineListPreview() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myPage() }),
      ])
      notify.success('루틴 이름을 변경했습니다.')
    },
    onError: (updateError) => {
      notify.error(updateError.message || '루틴 이름 변경에 실패했습니다.')
    },
  })
  const isRoutineActionPending = deleteRoutineMutation.isPending || updateRoutineNameMutation.isPending

  function handleOpenMoreSheet() {
    if (!isValidId || isRoutineActionPending) {
      return
    }
    setIsMoreSheetOpen(true)
  }

  function handleEditRoutineClick() {
    if (!isValidId || isRoutineActionPending) {
      return
    }
    setIsMoreSheetOpen(false)
    setIsRenameSheetOpen(true)
  }

  async function handleRenameRoutineSubmit(nextRoutineName: string) {
    if (!isValidId || isRoutineActionPending) {
      return
    }

    try {
      await updateRoutineNameMutation.mutateAsync({
        routineGroupId,
        title: nextRoutineName,
      })
      setIsRenameSheetOpen(false)
    } catch {
      // onError에서 사용자 메시지를 처리하므로 여기서는 추가 처리하지 않습니다.
    }
  }

  function handleDeleteRoutineClick() {
    if (!isValidId || isRoutineActionPending) {
      return
    }
    setIsMoreSheetOpen(false)
    setIsDeleteDialogOpen(true)
  }

  function handleDeleteRoutineConfirm() {
    if (!isValidId || isRoutineActionPending) {
      return
    }
    setIsDeleteDialogOpen(false)
    deleteRoutineMutation.mutate(routineGroupId)
  }

  if (!id || Number.isNaN(routineGroupId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          올바른 루틴 ID가 아닙니다.
        </AlertMessage>
      </MobilePage>
    )
  }

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          루틴을 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !routineDetail) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '루틴을 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const selectedRoutine = activeTabId === 'am' ? routineDetail.amRoutine : routineDetail.pmRoutine
  const products = selectedRoutine.products

  return (
    <MobilePage
      header={
        <PageHeader
          actionSlot={
            <button
              aria-label="루틴 더보기"
              className="inline-flex size-5 items-center justify-center disabled:opacity-50"
              disabled={isRoutineActionPending}
              onClick={handleOpenMoreSheet}
              type="button"
            >
              <img alt="" aria-hidden className="size-5" src={moreVerticalDetailIcon} />
            </button>
          }
          backTo={APP_ROUTES.myPageRoutines}
          title={routineDetail.title}
        />
      }
      mainClassName="flex h-[100dvh] flex-col bg-neutral-50 px-0"
    >
      <section className="flex h-[100dvh] flex-col">
        <div className="h-[54px] border-b border-neutral-100 bg-common-0 px-5 pt-2">
          <div className="flex h-full items-center gap-2">
            {ROUTINE_TAB_ITEMS.map((item) => {
              const isActive = activeTabId === item.id
              return (
                <button
                  className="relative flex h-full flex-1 items-center justify-center px-2.5"
                  key={item.id}
                  onClick={() => {
                    if (item.id === activeTabId) return
                    setSlideDirection(item.id === 'pm' ? 1 : -1)
                    setSearchParams(
                      (prevParams) => {
                        const nextParams = new URLSearchParams(prevParams)
                        nextParams.set('tab', item.id)
                        return nextParams
                      },
                      { replace: true },
                    )
                  }}
                  type="button"
                >
                  <span
                    className={cn(
                      'text-[18px] leading-[25.56px]',
                      isActive ? 'font-bold text-neutral-800' : 'font-medium text-neutral-400',
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800"
                      layoutId="routine-tab-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto hide-scrollbar bg-neutral-50 px-5 py-5 pb-13">
          <AnimatePresence custom={slideDirection} initial={false} mode="wait">
            <motion.div
              key={activeTabId}
              animate="center"
              custom={slideDirection}
              exit="exit"
              initial="enter"
              transition={{ type: 'tween', duration: 0.16, ease: 'easeOut' }}
              variants={{
                enter: (dir: number) => ({ x: dir > 0 ? '40%' : '-40%', opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: dir > 0 ? '-40%' : '40%', opacity: 0 }),
              }}
            >
              {products.length > 0 ? (
                <div className="flex flex-col gap-5 pb-8">
                  {products.map((product, index) => (
                    <RoutineStepCard
                      from={location.pathname + location.search + location.hash}
                      key={product.productId}
                      product={product}
                      stepNumber={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-common-0 px-4 py-8 text-center text-sm text-neutral-400">
                  표시할 루틴 단계가 없습니다.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <RoutineMoreBottomSheet
        actionDisabled={isRoutineActionPending}
        onDelete={handleDeleteRoutineClick}
        onEdit={handleEditRoutineClick}
        onOpenChange={setIsMoreSheetOpen}
        open={isMoreSheetOpen}
      />

      <RoutineNameBottomSheet
        closeAriaLabel="루틴 이름 변경 시트 닫기"
        initialValue={routineDetail.title}
        isSubmitting={updateRoutineNameMutation.isPending}
        onOpenChange={setIsRenameSheetOpen}
        onSubmit={handleRenameRoutineSubmit}
        open={isRenameSheetOpen}
        title="루틴 이름 변경"
      />

      <ConfirmActionDialog
        confirmDisabled={isRoutineActionPending}
        confirmLabel={deleteRoutineMutation.isPending ? '삭제 중...' : '확인'}
        description="삭제된 루틴은 복구할 수 없습니다."
        onConfirm={handleDeleteRoutineConfirm}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        title="루틴을 삭제하시겠습니까?"
      />
    </MobilePage>
  )
}

export default RoutineDetailPage
