import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createProductDetailPath } from '../../app/routes'
import type { RoutineProduct } from '../../api/types'
import AlertMessage from '../../components/common/AlertMessage'
import MobilePage from '../../components/MobilePage'
import ResultPageHeader from '../../components/results/ResultPageHeader'
import ResultTabBar from '../../components/results/ResultTabBar'
import ResultTopSection from '../../components/results/ResultTopSection'
import { DrawerContentBottom, DrawerRoot } from '../../components/ui/drawer'
import { Input } from '../../components/ui/input'
import { PRODUCT_CATEGORY_LABELS } from '../../domain/surveyConfig'
import { notify } from '../../lib/notify'
import { cn } from '../../lib/utils'
import { createSavedRoutineGroupKey, useSurveyResultStore } from '../../stores/surveyResultStore'
import { createResultHeaderViewModelFromSummary } from './resultViewModel'
import { getRoutineStepPreset, type RoutineTabId } from './routineStepPresets'
import { useRoutineStackLayout } from './useRoutineStackLayout'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { useWindowSnapToElement } from '../../hooks/useWindowSnapToElement'
import { useResultDetail } from './useResultDetail'
import { useResultRoutine } from './useResultRoutine'

type RoutineNameFieldState = 'placeholder' | 'focus' | 'typed'

const ROUTINE_NAME_MAX_LENGTH = 10
const ROUTINE_CARD_CLASS = 'flex flex-col gap-[15px] rounded-lg border border-neutral-100 bg-common-0 p-4'
const STEP_BADGE_CLASS =
  'inline-flex min-w-6 items-center justify-center rounded-[20px] bg-neutral-800 px-2 py-1 text-xs font-bold leading-[16.32px] text-neutral-50'
const INGREDIENT_CHIP_CLASS =
  'inline-flex items-center justify-center rounded bg-primary-50 px-1.5 py-0.5 text-[12px] font-medium leading-[14.3px] text-primary-500'
const STEP_ACTION_LINK_CLASS =
  'inline-flex h-8 w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-4 text-sm font-semibold leading-[20.44px] text-neutral-600'
const SAVE_ROUTINE_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600'
const GO_MYPAGE_LINK_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg bg-neutral-800 px-6 py-3 text-base font-semibold leading-[23.68px] text-common-0'
const SAVE_SHEET_CLOSE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-full bg-[#1212121A] p-1 outline outline-[0.5px] -outline-offset-[0.5px] outline-neutral-100 backdrop-blur-[2px]'
const ROUTINE_SAVED_TOASTER_ID = 'result-routine-saved'
const ROUTINE_SAVED_TOAST_ID = 'result-routine-saved-toast'
const ROUTINE_SAVED_TOAST_WRAPPER_CLASS = 'w-full border-0 bg-[#0D0F0CE5]/90 rounded-[8px] p-0 shadow-none'

const ROUTINE_PAGE_COPY = {
  title: '루틴 추천받기',
  intro: '아침과 저녁\n단계별 루틴을 안내해드려요.',
  saveRoutine: '이 루틴 저장하기',
  goMyPage: '마이페이지 바로가기',
  stepActionLabel: '이 단계 제품 보기',
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
const CARD_PEEK_HEIGHT_PX = 84
const STACK_CARD_FLOW_GAP_PX = 20
const WINDOW_SNAP_TRIGGER_PX = 80
const FOOTER_SAFE_AREA_PADDING = 'calc(16px + env(safe-area-inset-bottom))'

interface RoutineStepCardProps {
  stepNumber: number
  stepIndex: number
  tabId: RoutineTabId
  product: RoutineProduct
}

function RoutineStepCard({ stepNumber, stepIndex, tabId, product }: RoutineStepCardProps) {
  const preset = getRoutineStepPreset(tabId, stepIndex)

  return (
    <article className={ROUTINE_CARD_CLASS}>
      <div className="inline-flex items-center gap-2">
        <span className={STEP_BADGE_CLASS}>{stepNumber}</span>
        <h3 className="text-base font-semibold leading-[23.68px] text-neutral-900">{PRODUCT_CATEGORY_LABELS[product.category]}</h3>
      </div>

      <div className="inline-flex flex-wrap items-center gap-1">
        {preset.ingredients.map((ingredient) => (
          <span className={INGREDIENT_CHIP_CLASS} key={`${product.productId}-${ingredient}`}>
            {ingredient}
          </span>
        ))}
      </div>

      <p className="text-[13px] leading-[18.2px] text-neutral-700">{preset.description}</p>

      <Link className={STEP_ACTION_LINK_CLASS} to={createProductDetailPath(product.productId)}>
        {ROUTINE_PAGE_COPY.stepActionLabel}
      </Link>
    </article>
  )
}

interface RoutineSavedToastProps {
  onMoveToMyPage: () => void
}

function RoutineSavedToast({ onMoveToMyPage }: RoutineSavedToastProps) {
  return (
    <div className="flex w-full max-w-[350px] flex-col items-start gap-2.5 rounded-[8px] bg-[rgba(13, 15, 12, 0.90)] p-3 shadow-[0px_2px_4px_rgba(13,15,12,0.05),0px_2px_20px_rgba(13,15,12,0.05)]">
      <div className="flex w-full flex-col items-start gap-0.5">
        <p className="text-[15px] font-medium leading-[22.2px] text-common-0">{ROUTINE_PAGE_COPY.savedToastTitle}</p>
        <p className="text-xs font-medium leading-[16.32px] text-neutral-150">{ROUTINE_PAGE_COPY.savedToastDescription}</p>
      </div>
      <button
        className="inline-flex w-full items-center justify-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-primary-400"
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
  const { id } = useParams<{ id: string }>()
  const skinResultId = Number(id)
  const [activeTabId, setActiveTabId] = useState<RoutineTabId>('am')
  const [isResetting, setIsResetting] = useState(false)
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false)
  const [routineNameDraft, setRoutineNameDraft] = useState('')
  const [isRoutineNameFocused, setIsRoutineNameFocused] = useState(false)
  const { savedRoutineKey, savedRoutineName, markRoutineSavedByKey } = useSurveyResultStore(
    useShallow((state) => ({
      savedRoutineKey: state.savedRoutineKey,
      savedRoutineName: state.savedRoutineName,
      markRoutineSavedByKey: state.markRoutineSavedByKey,
    })),
  )
  const { data: detail, isLoading: isDetailLoading, error: detailError } = useResultDetail()
  const { data: routineGroup, isLoading: isRoutineLoading, error: routineError } = useResultRoutine(skinResultId)

  const isLoading = isDetailLoading || isRoutineLoading
  const error = detailError ?? routineError
  const selectedRoutine = routineGroup ? (activeTabId === 'am' ? routineGroup.amRoutine : routineGroup.pmRoutine) : null
  const sortedProducts = selectedRoutine ? [...selectedRoutine.products].sort((a, b) => a.sortOrder - b.sortOrder) : []
  const cardCount = sortedProducts.length
  const stackLayoutKey = `${skinResultId}:${activeTabId}:${cardCount}`

  const tabBarContainerRef = useRef<HTMLDivElement>(null)
  const whiteShellRef = useRef<HTMLDivElement>(null)
  const whiteContainerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const [tabBarHeight, setTabBarHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const { ref: whiteBoxSentinelRef, isCollapsed: isHeaderScrolled } = useScrollCollapse<HTMLDivElement>(
    '-49px 0px 0px 0px',
  )
  const effectiveHeaderHeight = HEADER_HEIGHT_PX + tabBarHeight

  useWindowSnapToElement({
    targetRef: whiteShellRef,
    stickyOffset: HEADER_HEIGHT_PX,
    triggerThreshold: WINDOW_SNAP_TRIGGER_PX,
  })

  const { trackRef, registerCardRef, metrics, progress, phase, cardOffsets } = useRoutineStackLayout({
    cardCount,
    headerHeight: effectiveHeaderHeight,
    cardPeekHeight: CARD_PEEK_HEIGHT_PX,
    cardFlowGap: STACK_CARD_FLOW_GAP_PX,
    resetKey: stackLayoutKey,
    scrollContainerRef: whiteContainerRef,
  })

  useEffect(() => {
    return () => {
      notify.dismiss(ROUTINE_SAVED_TOAST_ID)
    }
  }, [])

  useEffect(() => {
    if (!isHeaderScrolled && whiteContainerRef.current) {
      setIsResetting(true)
      whiteContainerRef.current.scrollTop = 0
    } else if (isHeaderScrolled) {
      setIsResetting(false)
    }
  }, [isHeaderScrolled])

  useLayoutEffect(() => {
    const el = tabBarContainerRef.current
    if (!el) return
    setTabBarHeight(el.getBoundingClientRect().height)
    const observer = new ResizeObserver(() => {
      setTabBarHeight(el.getBoundingClientRect().height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const el = footerRef.current
    if (!el) return

    setFooterHeight(el.getBoundingClientRect().height)
    const observer = new ResizeObserver(() => {
      setFooterHeight(el.getBoundingClientRect().height)
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  if (!id || Number.isNaN(skinResultId)) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          ?щ컮瑜?寃곌낵 ID媛 ?꾨떃?덈떎.
        </AlertMessage>
      </MobilePage>
    )
  }

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          猷⑦떞??遺덈윭?ㅻ뒗 以묒엯?덈떎...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !routineGroup || !detail) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '猷⑦떞??遺덈윭?ㅼ? 紐삵뻽?듬땲??'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const header = createResultHeaderViewModelFromSummary(detail.resultSummary)
  const savedKey = createSavedRoutineGroupKey(routineGroup.routineGroupId)
  const isRoutineSaved = savedRoutineKey === savedKey
  const routineNameLength = routineNameDraft.length
  const trimmedRoutineName = routineNameDraft.trim()
  const canSubmitRoutineName = trimmedRoutineName.length > 0
  const routineNameFieldState: RoutineNameFieldState =
    routineNameLength > 0 ? 'typed' : isRoutineNameFocused ? 'focus' : 'placeholder'
  const isStackReady = metrics.isReady
  const bodyBottomPadding = isHeaderScrolled ? footerHeight + 40 : 40

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
    setRoutineNameDraft(savedRoutineName ?? '')
    setIsRoutineNameFocused(false)
    setIsSaveSheetOpen(true)
  }

  function handleSaveRoutineSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmitRoutineName) {
      return
    }

    markRoutineSavedByKey(savedKey, trimmedRoutineName)
    setRoutineNameDraft(trimmedRoutineName)
    setIsRoutineNameFocused(false)
    setIsSaveSheetOpen(false)
    showRoutineSavedToast()
  }

  function getAnimatedCardStyle(index: number): CSSProperties {
    const staggerOffset = index * 0.08
    const span = 1 - staggerOffset
    const localProgress = span > 0 ? Math.min(1, Math.max(0, (progress - staggerOffset) / span)) : 1
    const easedProgress = localProgress * localProgress * (3 - 2 * localProgress)

    return {
      top: metrics.collapsedTops[index] ?? 0,
      transform: `translateY(${(cardOffsets[index] ?? 0) * (1 - easedProgress)}px)`,
      zIndex: index + 1,
      transition: `transform ${isResetting ? 350 + index * 60 : 100 + index * 30}ms cubic-bezier(0.2, 0, 0, 1)`,
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
      <MobilePage
        header={<ResultPageHeader isScrolled={isHeaderScrolled} title={ROUTINE_PAGE_COPY.title} />}
      >
        <section className="space-y-0">
          <ResultTopSection header={header} intro={ROUTINE_PAGE_COPY.intro} skinResultId={skinResultId} />
          <div ref={whiteBoxSentinelRef} aria-hidden className="h-px" />

          <div
            ref={whiteShellRef}
            className="-mx-4 sticky top-12 h-[calc(100dvh-48px)] bg-common-0"
          >
            <div className="relative flex h-full min-h-0 flex-col">
              <div ref={tabBarContainerRef} className="shrink-0 bg-common-0 px-4">
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
                  'min-h-0 flex-1 bg-common-0 hide-scrollbar',
                  isHeaderScrolled ? 'overflow-y-auto' : 'overflow-y-hidden',
                )}
              >
                <section className="px-4 pt-5" style={{ paddingBottom: bodyBottomPadding }}>
                  <div
                    className="relative isolate z-0"
                    data-stack-phase={isStackReady ? phase : 'stacking'}
                    ref={trackRef}
                    style={isStackReady ? { height: metrics.trackHeight + 270 } : undefined}
                  >
                    {isStackReady ? (
                      <div className="sticky isolate z-0 overflow-visible" style={{ top: 20, height: metrics.stickyHeight }}>
                        <div className="relative overflow-visible" style={{ height: metrics.stickyHeight }}>
                          {sortedProducts.map((product, index) => (
                            <div
                              className="absolute inset-x-0 will-change-transform"
                              key={`${product.productId}-${product.sortOrder}`}
                              ref={registerCardRef(index)}
                              style={getAnimatedCardStyle(index)}
                            >
                              <RoutineStepCard
                                product={product}
                                stepIndex={index}
                                stepNumber={index + 1}
                                tabId={activeTabId}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {sortedProducts.map((product, index) => (
                          <div key={`${product.productId}-${product.sortOrder}`} ref={registerCardRef(index)}>
                            <RoutineStepCard
                              product={product}
                              stepIndex={index}
                              stepNumber={index + 1}
                              tabId={activeTabId}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div
                ref={footerRef}
                className={cn(
                  'absolute inset-x-0 bottom-0 z-10 border-t border-neutral-100 bg-common-0 px-4 pt-3 will-change-transform transition-transform transition-opacity duration-200 ease-out',
                  isHeaderScrolled ? 'translate-y-0 opacity-100 transition-transform duration-500' : 'pointer-events-none translate-y-full opacity-0',
                )}
                style={{ paddingBottom: FOOTER_SAFE_AREA_PADDING }}
              >
                {routineAction}
              </div>
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
                aria-label="猷⑦떞 ????쒗듃 ?リ린"
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
                  canSubmitRoutineName ? 'bg-neutral-800 text-common-0 hover:bg-neutral-900' : 'bg-neutral-100 text-neutral-300',
                )}
                disabled={!canSubmitRoutineName}
                type="submit"
              >
                {ROUTINE_PAGE_COPY.saveSheetSubmit}
              </button>
            </div>
          </form>
        </DrawerContentBottom>
      </DrawerRoot>
    </>
  )
}

export default ResultRoutinePage
