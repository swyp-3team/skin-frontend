import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createProductDetailPath } from '../../app/routes'
import type { RoutineRecommendedProduct, RoutineStepCategory } from '../../api/types'
import { apiClient } from '../../api'
import AlertMessage from '../../components/common/AlertMessage'
import SafeImage from '../../components/common/SafeImage'
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
const ROUTINE_CARD_CLASS =
  'flex flex-col gap-[15px] rounded-xl outline outline-1 -outline-offset-1 outline-neutral-100 bg-common-0 p-3'
const STEP_BADGE_CLASS =
  'inline-flex px-1.5 py-1 items-center size-[22px] justify-center rounded-[8px] bg-neutral-800 text-[12px] font-bold leading-[16.32px] text-neutral-50'
const PRODUCT_CATEGORY_CHIP_CLASS =
  'inline-flex self-start items-center justify-center rounded bg-primary-50 px-1 py-0.5 text-[10px] font-medium leading-[13px] text-primary-500'
const ROUTINE_PRODUCT_LINK_CLASS = 'inline-flex w-full items-center gap-3 bg-common-0 no-underline'
const SAVE_ROUTINE_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600'
const GO_MYPAGE_LINK_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg bg-neutral-800 px-6 py-3 text-base font-semibold leading-[23.68px] text-common-0'
const SAVE_SHEET_CLOSE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-full bg-[#1212121A] p-1 outline outline-[0.5px] -outline-offset-[0.5px] outline-neutral-100 backdrop-blur-[2px]'
const ROUTINE_SAVED_TOASTER_ID = 'result-routine-saved'
const ROUTINE_SAVED_TOAST_ID = 'result-routine-saved-toast'
const ROUTINE_SAVED_TOAST_WRAPPER_CLASS = 'w-full rounded-[8px] border-0 bg-[#0D0F0CE5]/90 p-0 shadow-none'

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
const ROUTINE_STEP_TITLE_BY_STEP_CATEGORY: Record<RoutineStepCategory, string> = {
  PREPARE: '피부 결 정돈',
  INTENSIVE_CARE: '집중 케어',
  MOISTURIZER: '보습',
  SUN_CARE: '자외선 차단',
}

const ROUTINE_PRODUCT_CATEGORY_LABELS: Record<RoutineRecommendedProduct['productCategory'], string> = {
  SKIN: '스킨',
  TONER: '토너',
  LOTION: '로션',
  EMULSION: '에멀전',
  ESSENCE: '에센스',
  SERUM: '세럼',
  AMPOULE: '앰플',
  CREAM: '크림',
  SUN_CARE: '선케어',
}

interface RoutineStepCardProps {
  stepNumber: number
  product: RoutineRecommendedProduct
}

function RoutineStepCard({ stepNumber, product }: RoutineStepCardProps) {
  return (
    <article className={ROUTINE_CARD_CLASS}>
      <div className="inline-flex items-center gap-2">
        <span className={STEP_BADGE_CLASS}>{stepNumber}</span>
        <h3 className="text-base font-semibold leading-[23.68px] text-black">
          {ROUTINE_STEP_TITLE_BY_STEP_CATEGORY[product.routineStepCategory]}
        </h3>
      </div>

      <Link className={ROUTINE_PRODUCT_LINK_CLASS} to={createProductDetailPath(product.productId)}>
        <SafeImage
          alt={product.name}
          className="size-20 rounded object-cover"
          fallbackAlt={`${product.name} 이미지`}
          loading="lazy"
          src={product.imageUrl}
        />
        <div className="inline-flex h-20 min-w-0 flex-1 flex-col justify-center gap-2">
          <span className={PRODUCT_CATEGORY_CHIP_CLASS}>{ROUTINE_PRODUCT_CATEGORY_LABELS[product.productCategory]}</span>
          <p className="line-clamp-2 text-xs leading-[16.32px] text-neutral-800">{product.name}</p>
        </div>
      </Link>
    </article>
  )
}

interface RoutineSavedToastProps {
  onMoveToMyPage: () => void
}

function RoutineSavedToast({ onMoveToMyPage }: RoutineSavedToastProps) {
  return (
    <div className="flex w-full max-w-[350px] flex-col items-start gap-2.5 rounded-[8px] bg-[rgba(13,15,12,0.90)] p-3 shadow-[0px_2px_4px_rgba(13,15,12,0.05),0px_2px_20px_rgba(13,15,12,0.05)]">
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
  const { data: routineData, isLoading: isRoutineLoading, error: routineError } = useRoutineRecommendation()

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

  useEffect(() => {
    if (!isHeaderScrolled && whiteContainerRef.current) {
      whiteContainerRef.current.scrollTop = 0
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

  const skinResultId = recommendation.skinResultId
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
                isHeaderScrolled ? 'overflow-y-auto' : 'overflow-y-hidden',
              )}
            >
              <section className="space-y-5 px-4 pb-10 pt-5">
                {products.map((product, index) => (
                  <RoutineStepCard key={product.productId} product={product} stepNumber={index + 1} />
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
