import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES } from '../../app/routes'
import { apiClient } from '../../api'
import AlertMessage from '../../components/common/AlertMessage'
import LoadingScreen from '../../components/common/LoadingScreen'
import RecommendationNotice from '../../components/common/RecommendationNotice'
import CardStack from '../../components/common/CardStack'
import RoutineNameBottomSheet from '../../components/common/RoutineNameBottomSheet'
import RoutineStepCard from '../../components/common/RoutineStepCard'
import MobilePage from '../../components/MobilePage'
import PageHeader from '../../components/headers/PageHeader'
import ResultTabBar from '../../components/results/ResultTabBar'
import ResultTopSection from '../../components/results/ResultTopSection'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { useWindowSnapToElement } from '../../hooks/useWindowSnapToElement'
import { notify } from '../../lib/notify'
import { cn } from '../../lib/utils'
import { useSurveyResultStore } from '../../stores/surveyResultStore'
import type { RoutineTabId } from '../../components/results/types'
import { useProfileHeader } from './useResultDetail'
import { useRoutineRecommendation } from './useResultRoutine'

const SAVE_ROUTINE_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600'
const GO_MYPAGE_LINK_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg bg-neutral-800 px-6 py-3 text-base font-semibold leading-[23.68px] text-common-0'
const ROUTINE_SAVED_TOASTER_ID = 'result-routine-saved'
const ROUTINE_SAVED_TOAST_ID = 'result-routine-saved-toast'
const ROUTINE_SAVED_TOAST_WRAPPER_CLASS = 'w-full rounded-[8px] border-0 bg-none p-0 shadow-none'

const ROUTINE_PAGE_COPY = {
  title: '루틴 추천받기',
  intro: '아침과 저녁, 단계별 루틴을 안내해드려요.',
  saveRoutine: '이 루틴 저장하기',
  goMyPage: '마이페이지 바로가기',
  saveSheetTitle: '루틴 저장',
  saveSheetPlaceholder: '루틴 이름을 입력하세요. (예: 여름 아침 루틴)',
  saveSheetSubmit: '저장',
  savedToastTitle: '루틴을 저장했어요!',
  savedToastDescription: '저장한 루틴은 마이페이지에서 확인할 수 있어요.',
  savedToastAction: '마이페이지 바로가기',
  recommendationNoticeDescription:
    '이 추천은 설문 응답을 기반으로 한 참고 정보이며, 의학적 진단·처방을 대신하지 않아요. 루틴 내 성분 조합은 일반적인 기준으로, 개인 피부 반응에 따라 다를 수 있어요. 최종 선택은 고객님께 있으며, 피부 고민이 심하거나 이상 반응이 나타나면 즉시 사용을 중단하고 전문의 상담을 받으세요.',
} as const

const ROUTINE_TAB_ITEMS = [
  { id: 'am', label: '아침 루틴' },
  { id: 'pm', label: '저녁 루틴' },
] as const

const HEADER_HEIGHT_PX = 48
const WINDOW_SNAP_TRIGGER_PX = 80
const FOOTER_SAFE_AREA_PADDING = 'calc(16px + env(safe-area-inset-bottom))'

interface RoutineSavedToastProps {
  onMoveToMyPage: () => void
}

function RoutineSavedToast({ onMoveToMyPage }: RoutineSavedToastProps) {
  return (
    <div className="inline-flex w-full flex-col items-start gap-2.5 rounded-[8px] p-3 bg-[rgba(13,15,12,0.90)] shadow-[0px_2px_4px_rgba(13,15,12,0.05),0px_2px_20px_rgba(13,15,12,0.05)]">
      <div className="flex w-full flex-col items-start gap-0.5">
        <p className="text-[15px] font-medium leading-[22.2px] text-common-0">{ROUTINE_PAGE_COPY.savedToastTitle}</p>
        <p className="text-xs font-medium leading-[16.32px] text-neutral-150">{ROUTINE_PAGE_COPY.savedToastDescription}</p>
      </div>
      <button
        className="inline-flex w-full items-center justify-center gap-0.5 pl-2 pr-0.5 py-1 text-xs font-medium leading-[16.32px] text-primary-400"
        onClick={onMoveToMyPage}
        type="button"
      >
        <span>{ROUTINE_PAGE_COPY.savedToastAction}</span>
        <ChevronRight className="size-4" strokeWidth={1.8} />
      </button>
    </div>
  )
}

function ResultRoutinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const resultId = Number(id)
  const [activeTabId, setActiveTabId] = useState<RoutineTabId>('am')
  const [slideDirection, setSlideDirection] = useState(0)
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { savedResultId, savedRoutineName, markRoutineSavedByResultId } = useSurveyResultStore(
    useShallow((state) => ({
      savedResultId: state.savedResultId,
      savedRoutineName: state.savedRoutineName,
      markRoutineSavedByResultId: state.markRoutineSavedByResultId,
    })),
  )
  const { data: header, isLoading: isHeaderLoading, error: headerError } = useProfileHeader(resultId)
  const { data: routineData, isLoading: isRoutineLoading, error: routineError } = useRoutineRecommendation(resultId)

  const isLoading = isHeaderLoading || isRoutineLoading
  const [isDelaying, setIsDelaying] = useState(false)
  const loadStartTimeRef = useRef<number | null>(null)
  const loadDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const error = headerError ?? routineError
  const recommendation = routineData?.recommendation ?? null
  const previewToken = routineData?.previewToken ?? null
  const selectedRoutine = recommendation ? (activeTabId === 'am' ? recommendation.amRoutine : recommendation.pmRoutine) : null
  const products = selectedRoutine ? selectedRoutine.products : []

  useEffect(() => {
    if (isLoading) {
      if (loadStartTimeRef.current === null) {
        loadStartTimeRef.current = Date.now()
      }
      return
    }

    if (loadStartTimeRef.current === null) {
      return
    }

    const elapsed = Date.now() - loadStartTimeRef.current
    const remaining = Math.max(0, 3000 - elapsed)
    loadStartTimeRef.current = null

    if (remaining <= 0) {
      setIsDelaying(false)
      return
    }

    setIsDelaying(true)
    loadDelayTimerRef.current = setTimeout(() => {
      setIsDelaying(false)
      loadDelayTimerRef.current = null
    }, remaining)

    return () => {
      if (loadDelayTimerRef.current !== null) {
        clearTimeout(loadDelayTimerRef.current)
        loadDelayTimerRef.current = null
      }
    }
  }, [isLoading])

  const whiteShellRef = useRef<HTMLDivElement>(null)
  const whiteContainerRef = useRef<HTMLDivElement>(null)
  const { ref: whiteBoxSentinelRef, isCollapsed: isHeaderScrolled } = useScrollCollapse<HTMLDivElement>(
    '-49px 0px 0px 0px',
  )

  useWindowSnapToElement({
    targetRef: whiteShellRef,
    stickyOffset: HEADER_HEIGHT_PX,
    triggerThreshold: WINDOW_SNAP_TRIGGER_PX,
  })

  useEffect(() => {
    return () => {
      notify.dismiss(ROUTINE_SAVED_TOAST_ID)
      if (loadDelayTimerRef.current !== null) {
        clearTimeout(loadDelayTimerRef.current)
      }
    }
  }, [])

  const [isInnerScrollResetting, setIsInnerScrollResetting] = useState(false)
  const innerScrollRafRef = useRef<number | null>(null)

  useEffect(() => {
    if (isHeaderScrolled) {
      setIsInnerScrollResetting(false)
      if (innerScrollRafRef.current !== null) {
        cancelAnimationFrame(innerScrollRafRef.current)
        innerScrollRafRef.current = null
      }
      return
    }

    const container = whiteContainerRef.current
    if (!container || container.scrollTop === 0) return

    setIsInnerScrollResetting(true)

    const startScrollTop = container.scrollTop
    const duration = 700
    let startTime: number | null = null

    // easeOutCubic: 처음에 빠르게 시작해서 느리게 마무리
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      container.scrollTop = startScrollTop * (1 - easeOutCubic(progress))

      if (progress < 1) {
        innerScrollRafRef.current = requestAnimationFrame(animate)
      } else {
        container.scrollTop = 0
        innerScrollRafRef.current = null
        setIsInnerScrollResetting(false)
      }
    }

    innerScrollRafRef.current = requestAnimationFrame(animate)

    return () => {
      if (innerScrollRafRef.current !== null) {
        cancelAnimationFrame(innerScrollRafRef.current)
        innerScrollRafRef.current = null
      }
    }
  }, [isHeaderScrolled])

  if (!id || Number.isNaN(resultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          올바른 결과 ID가 아닙니다.
        </AlertMessage>
      </MobilePage>
    )
  }

  const showLoading = isLoading || isDelaying
  const skinResultId = recommendation?.resultId ?? 0
  const isRoutineSaved = savedResultId === skinResultId

  function handleMoveToMyPage() {
    notify.dismiss(ROUTINE_SAVED_TOAST_ID)
    navigate(APP_ROUTES.myPage)
  }

  function showRoutineSavedToast() {
    notify.custom(() => <RoutineSavedToast onMoveToMyPage={handleMoveToMyPage} />, {
      id: ROUTINE_SAVED_TOAST_ID,
      toasterId: ROUTINE_SAVED_TOASTER_ID,
      duration: 5000,
      position: 'top-center',
      unstyled: true,
      classNames: {
        toast: ROUTINE_SAVED_TOAST_WRAPPER_CLASS,
      },
    })
  }

  function handleSaveSheetOpenChange(nextOpen: boolean) {
    setIsSaveSheetOpen(nextOpen)
  }

  function handleOpenSaveSheet() {
    setIsSaveSheetOpen(true)
  }

  async function handleSaveRoutineSubmit(routineName: string) {
    const trimmedRoutineName = routineName.trim()
    if (trimmedRoutineName.length === 0 || !previewToken || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      await apiClient.saveRoutine({ title: trimmedRoutineName, previewToken })
      markRoutineSavedByResultId(skinResultId, trimmedRoutineName)
      setIsSaveSheetOpen(false)
      showRoutineSavedToast()
    } finally {
      setIsSaving(false)
    }
  }

  const routineAction = !isRoutineSaved ? (
    <button className={SAVE_ROUTINE_BUTTON_CLASS} onClick={handleOpenSaveSheet} type="button">
      {ROUTINE_PAGE_COPY.saveRoutine}
    </button>
  ) : (
    <Link className={GO_MYPAGE_LINK_CLASS} to={APP_ROUTES.myPage}>
      {ROUTINE_PAGE_COPY.goMyPage}
    </Link>
  )

  return (
    <>
      <AnimatePresence>
        {showLoading ? (
          <LoadingScreen
            key="routine-loading"
            texts={['결과를 가져오고 있어요', '루틴을 구성하고 있어요']}
          />
        ) : null}
      </AnimatePresence>

      {!showLoading && (error || !recommendation || !header) ? (
        <MobilePage>
          <AlertMessage size="md" variant="error">
            {error?.message ?? '루틴을 불러오지 못했습니다.'}
          </AlertMessage>
        </MobilePage>
      ) : null}

      {!showLoading && !error && recommendation && header ? (
        <>
          <MobilePage header={<PageHeader isScrolled={isHeaderScrolled} title={ROUTINE_PAGE_COPY.title} />}>
            <section className="space-y-0">
              <ResultTopSection header={header} intro={ROUTINE_PAGE_COPY.intro} resultId={resultId} />
              <div ref={whiteBoxSentinelRef} aria-hidden className="h-px" />

              <div
                ref={whiteShellRef}
                className="-mx-4 sticky top-12 flex h-[calc(100dvh-48px)] flex-col bg-common-0"
              >
                <div className="shrink-0 bg-common-0 px-5 py-3">
                  <RecommendationNotice description={ROUTINE_PAGE_COPY.recommendationNoticeDescription} />
                </div>

                <div className="relative z-10 shrink-0 bg-common-0 px-5">
                  <ResultTabBar
                    activeTabId={activeTabId}
                    className="pt-2"
                    items={ROUTINE_TAB_ITEMS}
                    mode="equal"
                    onChange={(tabId) => {
                      if (tabId === activeTabId) return
                      setSlideDirection(tabId === 'pm' ? 1 : -1)
                      setActiveTabId(tabId as RoutineTabId)
                    }}
                  />
                </div>

                <div
                  ref={whiteContainerRef}
                  className={cn(
                    'min-h-0 flex-1 overflow-x-hidden hide-scrollbar',
                    // 스크롤 리셋 애니메이션 중에는 overflow-y-auto 유지 (중단되지 않도록)
                    isHeaderScrolled || isInnerScrollResetting ? 'overflow-y-auto' : 'overflow-y-hidden',
                  )}
                >
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
                      <CardStack className="px-5 pb-10 pt-5">
                        {products.map((product, index) => (
                          <RoutineStepCard
                            key={product.productId}
                            from={location.pathname + location.search + location.hash}
                            product={product}
                            stepNumber={index + 1}
                          />
                        ))}
                      </CardStack>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div
                  className={cn(
                    'shrink-0 overflow-hidden border-t border-neutral-100 bg-common-0 px-4 pt-3',
                    'transition-[max-height,opacity] duration-300 ease-out',
                    isHeaderScrolled ? 'max-h-40 opacity-100' : 'pointer-events-none max-h-0 opacity-0',
                  )}
                  style={{ paddingBottom: FOOTER_SAFE_AREA_PADDING }}
                >
                  {routineAction}
                </div>
              </div>
            </section>
          </MobilePage>

          <RoutineNameBottomSheet
            closeAriaLabel="루틴 저장 시트 닫기"
            initialValue={savedResultId === resultId ? (savedRoutineName ?? '') : ''}
            isSubmitting={isSaving}
            onOpenChange={handleSaveSheetOpenChange}
            onSubmit={handleSaveRoutineSubmit}
            open={isSaveSheetOpen}
            placeholder={ROUTINE_PAGE_COPY.saveSheetPlaceholder}
            submitLabel={ROUTINE_PAGE_COPY.saveSheetSubmit}
            title={ROUTINE_PAGE_COPY.saveSheetTitle}
          />
        </>
      ) : null}
    </>
  )
}

export default ResultRoutinePage
