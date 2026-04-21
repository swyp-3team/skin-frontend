import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
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
import { cn } from '../../lib/utils'
import { createSavedRoutineGroupKey, useSurveyResultStore } from '../../stores/surveyResultStore'
import { createResultHeaderViewModel } from './resultViewModel'
import { getRoutineStepPreset, type RoutineTabId } from './routineStepPresets'
import { useResultRoutine } from './useResultRoutine'

type RoutineNameFieldState = 'placeholder' | 'focus' | 'typed'

const ROUTINE_NAME_MAX_LENGTH = 10
const ROUTINE_CARD_CLASS = 'flex flex-col gap-[15px] rounded-lg border border-neutral-100 bg-common-0 p-4'
const STEP_BADGE_CLASS =
  'inline-flex min-w-6 items-center justify-center rounded-[20px] bg-neutral-300 px-2 py-1 text-xs font-bold leading-[16.32px] text-neutral-500'
const INGREDIENT_CHIP_CLASS =
  'inline-flex items-center justify-center rounded bg-primary-50 px-1.5 py-0.5 text-[11px] font-medium leading-[14.3px] text-primary-500'
const STEP_ACTION_LINK_CLASS =
  'inline-flex h-8 w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-4 text-sm font-semibold leading-[20.44px] text-neutral-600'
const SAVE_ROUTINE_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600'
const GO_MYPAGE_LINK_CLASS =
  'inline-flex w-full items-center justify-center rounded-lg bg-neutral-800 px-6 py-3 text-base font-semibold leading-[23.68px] text-common-0'
const SAVE_SHEET_CLOSE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-full bg-[#1212121A] p-1 outline outline-[0.5px] -outline-offset-[0.5px] outline-neutral-100 backdrop-blur-[2px]'

const ROUTINE_PAGE_COPY = {
  title: '루틴 추천받기',
  intro: '아침과 저녁\n단계별 루틴을 안내해드려요.',
  saveRoutine: '이 루틴 저장하기',
  goMyPage: '마이페이지 바로가기',
  stepActionLabel: '이 단계 제품 보기',
  saveSheetTitle: '루틴 저장',
  saveSheetPlaceholder: '루틴 이름을 입력하세요. (예: 여름 아침 루틴)',
  saveSheetSubmit: '완료',
} as const

const ROUTINE_TAB_ITEMS = [
  { id: 'am', label: '아침 루틴' },
  { id: 'pm', label: '저녁 루틴' },
] as const

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

function ResultRoutinePage() {
  const { id } = useParams<{ id: string }>()
  const skinResultId = Number(id)
  const [activeTabId, setActiveTabId] = useState<RoutineTabId>('am')
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
  const { data: routineGroup, isLoading, error } = useResultRoutine(skinResultId)

  if (!id || Number.isNaN(skinResultId)) {
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

  if (error || !routineGroup) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '루틴을 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const header = createResultHeaderViewModel(routineGroup)
  const selectedRoutine = activeTabId === 'am' ? routineGroup.amRoutine : routineGroup.pmRoutine
  const savedKey = createSavedRoutineGroupKey(routineGroup.routineGroupId)
  const isRoutineSaved = savedRoutineKey === savedKey
  const sortedProducts = [...selectedRoutine.products].sort((a, b) => a.sortOrder - b.sortOrder)
  const routineNameLength = routineNameDraft.length
  const trimmedRoutineName = routineNameDraft.trim()
  const canSubmitRoutineName = trimmedRoutineName.length > 0
  const routineNameFieldState: RoutineNameFieldState =
    routineNameLength > 0 ? 'typed' : isRoutineNameFocused ? 'focus' : 'placeholder'

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
  }

  return (
    <>
      <MobilePage header={<ResultPageHeader title={ROUTINE_PAGE_COPY.title} />}>
        <section className="space-y-0 pb-10">
          <ResultTopSection header={header} intro={ROUTINE_PAGE_COPY.intro} skinResultId={skinResultId} />

          <div className="space-y-5">
            <ResultTabBar
              activeTabId={activeTabId}
              items={ROUTINE_TAB_ITEMS}
              mode="equal"
              onChange={(tabId) => setActiveTabId(tabId as RoutineTabId)}
            />

            <section className="space-y-5 px-0">
              {sortedProducts.map((product, index) => (
                <RoutineStepCard
                  key={`${product.productId}-${product.sortOrder}`}
                  product={product}
                  stepIndex={index}
                  stepNumber={index + 1}
                  tabId={activeTabId}
                />
              ))}

              {!isRoutineSaved ? (
                <button className={SAVE_ROUTINE_BUTTON_CLASS} onClick={handleOpenSaveSheet} type="button">
                  {ROUTINE_PAGE_COPY.saveRoutine}
                </button>
              ) : (
                <Link className={GO_MYPAGE_LINK_CLASS} to={APP_ROUTES.myPage}>
                  {ROUTINE_PAGE_COPY.goMyPage}
                </Link>
              )}
            </section>
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
                    aria-label="루틴 이름"
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
