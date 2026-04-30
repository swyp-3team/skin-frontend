import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import { APP_ROUTES } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import ConfirmActionDialog from '../components/common/ConfirmActionDialog'
import CardStack from '../components/common/CardStack'
import RoutineStepCard from '../components/common/RoutineStepCard'
import MobilePage from '../components/MobilePage'
import PageHeader from '../components/headers/PageHeader'
import { notify } from '../lib/notify'
import { queryKeys } from '../lib/queryKeys'
import { cn } from '../lib/utils'

type RoutineTabId = 'am' | 'pm'

const ROUTINE_TAB_ITEMS: { id: RoutineTabId; label: string }[] = [
  { id: 'am', label: '아침 루틴' },
  { id: 'pm', label: '저녁 루틴' },
]

function isValidRoutineGroupId(routineGroupId: number) {
  return Number.isFinite(routineGroupId) && routineGroupId > 0
}

function RoutineDetailPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const routineGroupId = Number(id)
  const [activeTabId, setActiveTabId] = useState<RoutineTabId>('am')
  const [slideDirection, setSlideDirection] = useState(0)
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

  function handleDeleteRoutineClick() {
    if (!isValidId || deleteRoutineMutation.isPending) {
      return
    }

    setIsDeleteDialogOpen(true)
  }

  function handleDeleteRoutineConfirm() {
    if (!isValidId || deleteRoutineMutation.isPending) {
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
          leftSlot={
            <button
              className="inline-flex items-center px-2 py-1 text-[14px] font-normal leading-[20.44px] text-red-400 disabled:text-neutral-300"
              disabled={deleteRoutineMutation.isPending}
              onClick={handleDeleteRoutineClick}
              type="button"
            >
              {deleteRoutineMutation.isPending ? '삭제 중...' : '삭제'}
            </button>
          }
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
                  className={cn(
                    'flex h-full flex-1 items-center justify-center border-b-2 px-2.5',
                    isActive ? 'border-neutral-800' : 'border-transparent',
                  )}
                  key={item.id}
                  onClick={() => {
                    if (item.id === activeTabId) return
                    setSlideDirection(item.id === 'pm' ? 1 : -1)
                    setActiveTabId(item.id)
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
                <CardStack className="pb-8">
                  {products.map((product, index) => (
                    <RoutineStepCard
                      from={location.pathname + location.search + location.hash}
                      key={product.productId}
                      product={product}
                      stepNumber={index + 1}
                    />
                  ))}
                </CardStack>
              ) : (
                <p className="rounded-xl bg-common-0 px-4 py-8 text-center text-sm text-neutral-400">
                  표시할 루틴 단계가 없습니다.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <ConfirmActionDialog
        confirmDisabled={deleteRoutineMutation.isPending}
        confirmLabel={deleteRoutineMutation.isPending ? '삭제 중...' : '확인'}
        description={
          <>
            삭제된 루틴은 복구할 수 없습니다.
            <br />
            삭제하시겠습니까?
          </>
        }
        onConfirm={handleDeleteRoutineConfirm}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        title="루틴 삭제 확인"
      />
    </MobilePage>
  )
}

export default RoutineDetailPage
