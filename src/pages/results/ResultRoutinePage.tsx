import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES } from '../../app/routes'
import { apiClient } from '../../api'
import AlertMessage from '../../components/common/AlertMessage'
import RoutineStepCard from '../../components/common/RoutineStepCard'
import MobilePage from '../../components/MobilePage'
import PageHeader from '../../components/common/PageHeader'
import ResultTabBar from '../../components/results/ResultTabBar'
import ResultTopSection from '../../components/results/ResultTopSection'
import { DrawerContentBottom, DrawerRoot } from '../../components/ui/drawer'
import { Input } from '../../components/ui/input'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { useWindowSnapToElement } from '../../hooks/useWindowSnapToElement'
import { notify } from '../../lib/notify'
import { cn } from '../../lib/utils'
import { useSurveyResultStore } from '../../stores/surveyResultStore'
import type { RoutineTabId } from '../../components/results/types'
import { useProfileHeader } from './useResultDetail'
import { useRoutineRecommendation } from './useResultRoutine'

type RoutineNameFieldState = 'placeholder' | 'focus' | 'typed'

const ROUTINE_NAME_MAX_LENGTH = 10
const SAVE_ROUTINE_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600'
const GO_MYPAGE_LINK_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg bg-neutral-800 px-6 py-3 text-base font-semibold leading-[23.68px] text-common-0'
const SAVE_SHEET_CLOSE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-full bg-[#1212121A] p-1 outline outline-[0.5px] -outline-offset-[0.5px] outline-neutral-100 backdrop-blur-[2px]'
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
  saveSheetSubmit: '완료',
  savedToastTitle: '루틴을 저장했어요!',
  savedToastDescription: '저장한 루틴은 마이페이지에서 확인할 수 있어요.',
  savedToastAction: '마이페이지 바로가기',
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
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false)
  const [routineNameDraft, setRoutineNameDraft] = useState('')
  const [isRoutineNameFocused, setIsRoutineNameFocused] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { savedResultId, savedRoutineName, markRoutineSavedByResultId } = useSurveyResultStore(
    useShallow((state) => ({
      savedResultId: state.savedResultId,
      savedRoutineName: state.savedRoutineName,
      markRoutineSavedByResultId: state.markRoutineSavedByResultId,
    })),
  )
  const { data: header, isLoading: isHeaderLoading, error: headerError } = useProfileHeader()
  const { data: routineData, isLoading: isRoutineLoading, error: routineError } = useRoutineRecommendation(resultId)

  const isLoading = isHeaderLoading || isRoutineLoading
  const error = headerError ?? routineError
  const recommendation = routineData?.recommendation ?? null
  const previewToken = routineData?.previewToken ?? null
  const selectedRoutine = recommendation ? (activeTabId === 'am' ? recommendation.amRoutine : recommendation.pmRoutine) : null
  const products = selectedRoutine ? selectedRoutine.products : []

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

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          루틴을 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !recommendation || !header) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '루틴을 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const skinResultId = recommendation.resultId
  const isRoutineSaved = savedResultId === skinResultId
  const routineNameLength = routineNameDraft.length
  const trimmedRoutineName = routineNameDraft.trim()
  const canSubmitRoutineName = trimmedRoutineName.length > 0
  const routineNameFieldState: RoutineNameFieldState =
    routineNameLength > 0 ? 'typed' : isRoutineNameFocused ? 'focus' : 'placeholder'

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
    if (!nextOpen) {
      setIsRoutineNameFocused(false)
    }
  }

  function handleOpenSaveSheet() {
    setRoutineNameDraft(savedResultId === resultId ? (savedRoutineName ?? '') : '')
    setIsRoutineNameFocused(false)
    setIsSaveSheetOpen(true)
  }

  async function handleSaveRoutineSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmitRoutineName || !previewToken || isSaving) {
      return
    }

    setIsSaving(true)
    try {
      await apiClient.saveRoutine({ title: trimmedRoutineName, previewToken })
      markRoutineSavedByResultId(skinResultId, trimmedRoutineName)
      setRoutineNameDraft(trimmedRoutineName)
      setIsRoutineNameFocused(false)
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
      <MobilePage header={<PageHeader isScrolled={isHeaderScrolled} title={ROUTINE_PAGE_COPY.title} />}>
        <section className="space-y-0">
          <ResultTopSection header={header} intro={ROUTINE_PAGE_COPY.intro} resultId={resultId} />
          <div ref={whiteBoxSentinelRef} aria-hidden className="h-px" />

          <div
            ref={whiteShellRef}
            className="-mx-4 sticky top-12 flex h-[calc(100dvh-48px)] flex-col bg-common-0"
          >
            <div className="relative z-10 shrink-0 bg-common-0 px-4">
              <ResultTabBar
                activeTabId={activeTabId}
                items={ROUTINE_TAB_ITEMS}
                mode="equal"
                onChange={(tabId) => setActiveTabId(tabId as RoutineTabId)}
              />
            </div>

            <div
              ref={whiteContainerRef}
              className={cn(
                'min-h-0 flex-1 hide-scrollbar',
                // 스크롤 리셋 애니메이션 중에는 overflow-y-auto 유지 (중단되지 않도록)
                isHeaderScrolled || isInnerScrollResetting ? 'overflow-y-auto' : 'overflow-y-hidden',
              )}
            >
              <section className="space-y-5 px-4 pb-10 pt-5">
                {products.map((product, index) => (
                  <RoutineStepCard
                    key={product.productId}
                    from={location.pathname + location.search + location.hash}
                    product={product}
                    stepNumber={index + 1}
                  />
                ))}
              </section>
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

      <DrawerRoot open={isSaveSheetOpen} onOpenChange={handleSaveSheetOpenChange}>
        <DrawerContentBottom aria-label={ROUTINE_PAGE_COPY.saveSheetTitle}>
          <div className="w-full pt-2.5">
            <div className="inline-flex w-full items-center justify-between px-5 py-2.5">
              <div className="flex flex-1 items-center justify-center pl-8">
                <h2 className="text-base font-medium leading-[23.68px] text-neutral-800">{ROUTINE_PAGE_COPY.saveSheetTitle}</h2>
              </div>
              <button
                aria-label="루틴 저장 시트 닫기"
                className={SAVE_SHEET_CLOSE_BUTTON_CLASS}
                onClick={() => handleSaveSheetOpenChange(false)}
                type="button"
              >
                <X className="size-6 text-common-0" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <form className="w-full" onSubmit={handleSaveRoutineSubmit}>
            <div className="flex w-full flex-col gap-2.5 p-5">
              <div
                className={cn(
                  'flex flex-col gap-3 rounded-lg p-3',
                  routineNameFieldState === 'focus'
                    ? 'outline outline-2 -outline-offset-2 outline-primary-300'
                    : 'outline outline-1 -outline-offset-1 outline-neutral-150',
                )}
              >
                <div className="inline-flex w-full items-center gap-2.5 px-1">
                  <Input
                    aria-label="루틴 이름을 입력하세요"
                    className={cn(
                      'h-auto border-0 bg-transparent p-0 text-[15px] font-normal leading-[22.2px] shadow-none focus-visible:border-0 focus-visible:ring-0 placeholder:text-neutral-200',
                      routineNameFieldState === 'typed' ? 'text-neutral-800' : 'text-neutral-200',
                    )}
                    maxLength={ROUTINE_NAME_MAX_LENGTH}
                    onBlur={() => setIsRoutineNameFocused(false)}
                    onChange={(event) => setRoutineNameDraft(event.target.value)}
                    onFocus={() => setIsRoutineNameFocused(true)}
                    placeholder={ROUTINE_PAGE_COPY.saveSheetPlaceholder}
                    value={routineNameDraft}
                  />
                </div>

                <div className="flex w-full flex-col items-end justify-center gap-2.5">
                  <div className="inline-flex w-full items-center justify-end px-1">
                    <span className="text-xs font-medium leading-[16.32px] text-neutral-300">{routineNameLength}</span>
                    <span className="text-xs font-medium leading-[16.32px] text-neutral-300">/{ROUTINE_NAME_MAX_LENGTH}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2.5 px-5 pb-5">
              <button
                className={cn(
                  'inline-flex w-full min-w-[70px] items-center justify-center rounded-lg px-6 py-3 text-base font-medium leading-[23.68px] transition-colors',
                  canSubmitRoutineName && !isSaving ? 'bg-neutral-800 text-common-0 hover:bg-neutral-900' : 'bg-neutral-100 text-neutral-300',
                )}
                disabled={!canSubmitRoutineName || isSaving}
                type="submit"
              >
                {isSaving ? '저장 중...' : ROUTINE_PAGE_COPY.saveSheetSubmit}
              </button>
            </div>
          </form>
        </DrawerContentBottom>
      </DrawerRoot>
    </>
  )
}

export default ResultRoutinePage
