import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { IconCircleCheckFilled, IconX } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createResultDetailPath } from '../../app/routes'
import routineTabMoonOnIcon from '../../assets/icons/results/routine-tab-moon-on.svg'
import routineTabSunOnIcon from '../../assets/icons/results/routine-tab-sun-on.svg'
import AlertMessage from '../../components/common/AlertMessage'
import Chip from '../../components/common/Chip'
import PageHeading from '../../components/common/PageHeading'
import MobilePage from '../../components/MobilePage'
import { buttonVariants } from '../../components/ui/button'
import { DrawerContentBottom, DrawerRoot } from '../../components/ui/drawer'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { INGREDIENT_GROUP_LABELS } from '../../domain/surveyConfig'
import { cn } from '../../lib/utils'
import { createSavedRoutineKey, useSurveyStore } from '../../stores/surveyStore'
import { useResultDetail } from './useResultDetail'

type RoutineTabValue = 'am' | 'pm'
type RoutineNameFieldState = 'placeholder' | 'focus' | 'typed'

interface RoutineTabMeta {
  value: RoutineTabValue
  label: string
  iconSrc: string
}

interface RoutinePanelItem {
  id: string
  stepName: string
  description: string
}

interface RoutineDiagnosisCardProps {
  diagnosisItems: ReadonlyArray<{ key: string; label: string }>
  resultId: number
}

interface RoutinePanelProps {
  title: string
  isRoutineSaved: boolean
  onSaveRoutine: () => void
}

const ROUTINE_PAGE_COPY = {
  title: '루틴 추천받기',
  intro: '아침과 저녁, 단계별로 루틴을 안내드려요.',
  diagnosisTitle: '기초 진단 결과',
  viewResult: '결과 보기',
  retakeDiagnosis: '다시 진단하기',
  diagnosisDateFallback: '2010.02.03',
  diagnosisTimeFallback: '04:05',
  missingDiagnosis: '진단 정보 없음',
  saveRoutineCta: '루틴 저장하기',
  routineSavedCta: '마이페이지 바로가기',
  saveSheetTitle: '루틴 저장',
  saveSheetPlaceholder: '텍스트를 입력하세요.',
  saveSheetSubmit: '완료',
  saveSuccessTitle: '루틴을 저장했어요!',
  saveSuccessDescription: '저장한 루틴은 마이페이지에서 확인할 수 있어요.',
  goMyPage: '마이페이지 가기',
} as const

const ROUTINE_NAME_MAX_LENGTH = 10
const SAVE_TOAST_VISIBLE_DURATION_MS = 5000
const SAVE_TOAST_ANIMATION_DURATION = 0.24
const SAVE_TOAST_ANIMATION_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1]

const ROUTINE_TABS: readonly RoutineTabMeta[] = [
  { value: 'am', label: '아침', iconSrc: routineTabSunOnIcon },
  { value: 'pm', label: '저녁', iconSrc: routineTabMoonOnIcon },
]

const ROUTINE_PANEL_ITEMS: readonly RoutinePanelItem[] = [
  {
    id: 'toner',
    stepName: '토너',
    description: '나이아신아마이드가 함유된 제품으로 피지를 조절하고 모공을 개선해요',
  },
  {
    id: 'serum',
    stepName: '세럼',
    description: '나이아신아마이드가 함유된 제품으로 피지를 조절하고 모공을 개선해요',
  },
  {
    id: 'cream',
    stepName: '크림',
    description: '나이아신아마이드가 함유된 제품으로 피지를 조절하고 모공을 개선해요',
  },
]

function RoutineDiagnosisCard({ diagnosisItems, resultId }: RoutineDiagnosisCardProps) {
  return (
    <section className="flex flex-col gap-1">
      <p className="px-1 text-[15px] font-normal leading-[1.48] text-neutral-400">{ROUTINE_PAGE_COPY.diagnosisTitle}</p>
      <article className="overflow-hidden rounded-lg border border-neutral-200 bg-common-0">
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="flex items-center gap-1 text-sm leading-[1.46] text-neutral-600">
            <span>{ROUTINE_PAGE_COPY.diagnosisDateFallback}</span>
            <span className="text-neutral-300">{ROUTINE_PAGE_COPY.diagnosisTimeFallback}</span>
          </div>
          <Link
            className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-neutral-300 transition-colors hover:text-neutral-500"
            to={createResultDetailPath(resultId)}
          >
            {ROUTINE_PAGE_COPY.viewResult}
          </Link>
        </div>
        <div className="flex flex-wrap gap-1 px-3 py-3.5">
          {diagnosisItems.length > 0 ? (
            diagnosisItems.map((item) => (
              <Chip className="bg-primary-50 px-2 py-1 text-primary-500" key={item.key}>
                {item.label}
              </Chip>
            ))
          ) : (
            <Chip className="bg-neutral-100 px-2 py-1 text-neutral-500">{ROUTINE_PAGE_COPY.missingDiagnosis}</Chip>
          )}
        </div>
        <Link
          className={cn(
            buttonVariants({ variant: 'tertiary' }),
            'h-8 w-full rounded-none rounded-b-lg border-t border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-600',
          )}
          to={APP_ROUTES.survey}
        >
          {ROUTINE_PAGE_COPY.retakeDiagnosis}
        </Link>
      </article>
    </section>
  )
}

function RoutineProductPreview() {
  return (
    <div className="mt-2 inline-flex w-full max-w-[250px] items-center gap-2 rounded-lg p-1 outline outline-1 -outline-offset-1 outline-[#F3F3F3]">
      <div aria-hidden className="size-[60px] shrink-0 rounded bg-[#EBEBEB]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-medium text-black">추천 제품</p>
          <p className="text-[10px] font-medium text-black">[브랜드명]</p>
          <p className="truncate text-xs font-medium text-black">[제품명 최대 1줄 제품명 최대 1줄 제품명 최대 1줄]</p>
        </div>
      </div>
    </div>
  )
}

function RoutinePanel({ title, isRoutineSaved, onSaveRoutine }: RoutinePanelProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white outline outline-2 -outline-offset-3 outline-[#D0D0D0]">
      <div className="px-4 pb-4 pt-[19px]">
        <h3 className="text-base font-semibold text-black">{title}</h3>

        <div className="mt-8 flex flex-col gap-8">
          {ROUTINE_PANEL_ITEMS.map((item) => (
            <div className="flex items-start gap-4" key={item.id}>
              <div className="shrink-0 rounded-lg bg-[#D0D0D0] px-3 py-1">
                <p className="text-center text-xs font-medium text-black">{item.stepName}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="max-w-[251px] text-xs leading-[16.8px] text-black">{item.description}</p>
                <RoutineProductPreview />
              </div>
            </div>
          ))}
        </div>

        {!isRoutineSaved ? (
          <button
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#F3F3F3] px-2.5 py-2 text-base font-medium leading-[22.4px] text-black"
            onClick={onSaveRoutine}
            type="button"
          >
            {ROUTINE_PAGE_COPY.saveRoutineCta}
          </button>
        ) : (
          <Link
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-neutral-800 px-2.5 py-2 text-base font-medium leading-[22.4px] text-common-0"
            to={APP_ROUTES.myPage}
          >
            {ROUTINE_PAGE_COPY.routineSavedCta}
          </Link>
        )}
      </div>
    </div>
  )
}

function RoutinePeriodTabs({ isRoutineSaved, onSaveRoutine }: Pick<RoutinePanelProps, 'isRoutineSaved' | 'onSaveRoutine'>) {
  const [activeTab, setActiveTab] = useState<RoutineTabValue>('am')

  return (
    <Tabs className="w-full gap-0" value={activeTab} onValueChange={(value) => setActiveTab(value as RoutineTabValue)}>
      <TabsList className="h-auto w-full gap-1" variant="line">
        {ROUTINE_TABS.map((tab) => (
          <TabsTrigger
            className={cn(
              'h-auto gap-2 text-base font-semibold transition-all',
              activeTab === tab.value ? 'text-neutral-800 opacity-100' : 'text-neutral-400 opacity-45',
            )}
            key={tab.value}
            value={tab.value}
          >
            <img alt="" aria-hidden className="size-5" src={tab.iconSrc} />
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent className="pt-2" value="am">
        <RoutinePanel isRoutineSaved={isRoutineSaved} onSaveRoutine={onSaveRoutine} title="아침 루틴" />
      </TabsContent>
      <TabsContent className="pt-2" value="pm">
        <RoutinePanel isRoutineSaved={isRoutineSaved} onSaveRoutine={onSaveRoutine} title="저녁 루틴" />
      </TabsContent>
    </Tabs>
  )
}

function SaveSuccessCard() {
  return (
    <section className="flex w-full flex-col gap-2.5 rounded-[8px] border border-primary-100 bg-primary-50 p-3 shadow-[0px_2px_4px_rgba(13,15,12,0.05),0px_2px_20px_rgba(13,15,12,0.05)]">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2">
          <IconCircleCheckFilled className="size-6 text-primary-400" />
          <p className="text-[15px] font-medium leading-[22.2px] text-neutral-800">{ROUTINE_PAGE_COPY.saveSuccessTitle}</p>
        </div>
        <p className="text-xs font-medium leading-[16.32px] text-neutral-500">{ROUTINE_PAGE_COPY.saveSuccessDescription}</p>
      </div>
      <Link
        className="inline-flex w-full items-center justify-center rounded-lg bg-primary-400 px-4 py-1.5 text-[14px] font-semibold leading-[20.44px] text-common-0"
        to={APP_ROUTES.myPage}
      >
        {ROUTINE_PAGE_COPY.goMyPage}
      </Link>
    </section>
  )
}

function ResultRoutinePage() {
  const { data: result, error, isLoading, resultId } = useResultDetail()
  const { savedRoutineKey, savedRoutineName, markRoutineSaved } = useSurveyStore(
    useShallow((state) => ({
      savedRoutineKey: state.savedRoutineKey,
      savedRoutineName: state.savedRoutineName,
      markRoutineSaved: state.markRoutineSaved,
    })),
  )
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false)
  const [routineNameDraft, setRoutineNameDraft] = useState('')
  const [isRoutineNameFocused, setIsRoutineNameFocused] = useState(false)
  const [showSavedToastCard, setShowSavedToastCard] = useState(false)
  const saveToastTimerRef = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    return () => {
      if (saveToastTimerRef.current !== null) {
        window.clearTimeout(saveToastTimerRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          결과를 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !result) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '결과를 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const currentResult = result

  const diagnosisItems = currentResult.top3.map((item) => ({
    key: item.group,
    label: INGREDIENT_GROUP_LABELS[item.group],
  }))
  const currentRoutineKey = createSavedRoutineKey(currentResult)
  const isRoutineSaved = savedRoutineKey === currentRoutineKey
  const routineNameLength = routineNameDraft.length
  const trimmedRoutineName = routineNameDraft.trim()
  const canSubmitRoutineName = trimmedRoutineName.length > 0
  const routineNameFieldState: RoutineNameFieldState =
    routineNameLength > 0 ? 'typed' : isRoutineNameFocused ? 'focus' : 'placeholder'

  function handleSaveSheetOpenChange(nextOpen: boolean) {
    setIsSaveSheetOpen(nextOpen)
    if (!nextOpen) setIsRoutineNameFocused(false)
  }

  function handleOpenSaveSheet() {
    setRoutineNameDraft(savedRoutineName ?? '')
    setIsRoutineNameFocused(false)
    setIsSaveSheetOpen(true)
  }

  function handleSaveRoutineSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmitRoutineName) return

    markRoutineSaved(currentResult, trimmedRoutineName)
    setRoutineNameDraft(trimmedRoutineName)
    setIsRoutineNameFocused(false)
    setIsSaveSheetOpen(false)

    setShowSavedToastCard(true)
    if (saveToastTimerRef.current !== null) {
      window.clearTimeout(saveToastTimerRef.current)
    }
    saveToastTimerRef.current = window.setTimeout(() => {
      setShowSavedToastCard(false)
      saveToastTimerRef.current = null
    }, SAVE_TOAST_VISIBLE_DURATION_MS)
  }

  return (
    <>
      <MobilePage>
        <section className="flex flex-col gap-7 px-5 pb-10">
          <section className="flex flex-col">
            <PageHeading className="py-4 text-[20px] font-bold leading-[1.35] text-neutral-800">
              {ROUTINE_PAGE_COPY.title}
            </PageHeading>
            <div className="items-center pb-4 pt-8">
              <p className="max-w-[18rem] text-[22px] font-bold leading-[1.35] text-neutral-900">{ROUTINE_PAGE_COPY.intro}</p>
            </div>
          </section>

          <RoutineDiagnosisCard diagnosisItems={diagnosisItems} resultId={resultId} />

          <div className="flex flex-col gap-3">
            <RoutinePeriodTabs isRoutineSaved={isRoutineSaved} onSaveRoutine={handleOpenSaveSheet} />
          </div>
        </section>
      </MobilePage>

      <AnimatePresence>
        {showSavedToastCard ? (
          <motion.div
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className="fixed inset-x-0 top-0 z-[60] flex justify-center px-5 pt-[28px]"
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: SAVE_TOAST_ANIMATION_DURATION, ease: SAVE_TOAST_ANIMATION_EASING }}
          >
            <div className="w-full max-w-[350px]">
              <SaveSuccessCard />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DrawerRoot open={isSaveSheetOpen} onOpenChange={handleSaveSheetOpenChange}>
        <DrawerContentBottom aria-label={ROUTINE_PAGE_COPY.saveSheetTitle}>
          <div className="w-full pt-[10px]">
            <div className="inline-flex w-full items-center justify-between px-5 py-[10px]">
              <div className="flex flex-1 items-center justify-center pl-8">
                <h2 className="text-center text-base font-medium leading-[23.68px] text-neutral-800">{ROUTINE_PAGE_COPY.saveSheetTitle}</h2>
              </div>
              <div className="inline-flex items-center gap-[10px]">
                <button
                  aria-label="루틴 저장 닫기"
                  className="inline-flex items-center justify-center gap-[10px] rounded-full bg-[#1212121A] p-1 outline outline-[0.5px] -outline-offset-[0.5px] outline-neutral-100 backdrop-blur-[2px]"
                  onClick={() => handleSaveSheetOpenChange(false)}
                  type="button"
                >
                  <IconX className="size-6 text-common-0" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          <form className="w-full" onSubmit={handleSaveRoutineSubmit}>
            <div className="flex w-full flex-col gap-[10px] p-5">
              <div
                className={cn(
                  'flex flex-col gap-3 rounded-lg p-3',
                  routineNameFieldState === 'focus'
                    ? 'outline outline-2 -outline-offset-2 outline-primary-300'
                    : 'outline outline-1 -outline-offset-1 outline-neutral-150',
                )}
              >
                <div className="inline-flex w-full items-center gap-[10px] px-1">
                  <Input
                    aria-label="루틴 이름"
                    className={cn(
                      'h-auto border-0 bg-transparent p-0 text-[15px] font-normal leading-[22.2px] shadow-none focus-visible:border-0 focus-visible:ring-0',
                      routineNameFieldState === 'typed' ? 'text-neutral-800' : 'text-neutral-200',
                      'placeholder:text-neutral-200',
                    )}
                    maxLength={ROUTINE_NAME_MAX_LENGTH}
                    onBlur={() => setIsRoutineNameFocused(false)}
                    onChange={(event) => setRoutineNameDraft(event.target.value)}
                    onFocus={() => setIsRoutineNameFocused(true)}
                    placeholder={ROUTINE_PAGE_COPY.saveSheetPlaceholder}
                    value={routineNameDraft}
                  />
                </div>
                <div className="flex w-full flex-col items-end justify-center gap-[10px]">
                  <div className="inline-flex w-full items-center justify-end px-1">
                    <span className="text-xs font-medium leading-[16.32px] text-neutral-300">{routineNameLength}</span>
                    <span className="text-xs font-medium leading-[16.32px] text-neutral-300">/{ROUTINE_NAME_MAX_LENGTH}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-[10px] px-5 pb-5">
              <button
                className={cn(
                  'inline-flex w-full min-w-[70px] items-center justify-center gap-[10px] rounded-lg px-6 py-3 text-base font-medium leading-[23.68px] transition-colors',
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
