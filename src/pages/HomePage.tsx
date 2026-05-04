import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import type { ProfileData, RoutineListResponse } from '../api/types'
import quickStartArrowIcon from '../assets/icons/home/quick-start-arrow.svg'
import moonIcon from '../assets/icons/results/routine-tab-moon-on.svg'
import sunIcon from '../assets/icons/results/routine-tab-sun-on.svg'
import { APP_ROUTES, createResultDetailPath, createRoutineDetailPath } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import PageHeader from '../components/headers/PageHeader'
import MobilePage from '../components/MobilePage'
import { toYearMonthDay } from '../lib/dateDisplay'
import { queryKeys } from '../lib/queryKeys'
import { cn } from '../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'

type RoutineQuickStartTab = 'am' | 'pm'

interface RoutineQuickStartCardProps {
  title: string
  to?: string
  tab: RoutineQuickStartTab
}

function parseDate(value: string): Date | null {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const normalized = new Date(value.replace(/\./g, '-'))
  if (!Number.isNaN(normalized.getTime())) return normalized

  return null
}

function getElapsedDaysLabel(value: string): string {
  const parsed = parseDate(value)
  if (!parsed) return 'N일'

  const today = new Date()
  const diagnosedDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffMs = todayDate.getTime() - diagnosedDate.getTime()
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  return `${days}일`
}

function RoutineQuickStartCard({ title, to, tab }: RoutineQuickStartCardProps) {
  const iconSrc = tab === 'am' ? sunIcon : moonIcon
  const backgroundClassName = tab === 'am' ? 'bg-primary-150' : 'bg-neutral-100'
  const label = tab === 'am' ? '아침 루틴 시작하기' : '저녁 루틴 시작하기'
  const baseClassName =
    'flex min-h-[124px] flex-1 flex-col justify-between rounded-[12px] p-3 transition-colors duration-200'

  const content = (
    <>
      <div className="space-y-2">
        <img alt="" aria-hidden className={tab === 'am' ? 'size-6' : 'size-5'} src={iconSrc} />
        <p className="text-[14px] font-medium leading-[20.44px] text-neutral-800">{label}</p>
      </div>
      <div className="flex justify-end">
        <img
          alt=""
          aria-hidden
          className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
          src={quickStartArrowIcon}
        />
      </div>
    </>
  )

  if (!to) {
    return (
      <div className={cn(baseClassName, backgroundClassName, 'cursor-not-allowed opacity-50')}>
        {content}
      </div>
    )
  }

  return (
    <Link
      aria-label={`${title} ${label}`}
      className={cn(baseClassName, backgroundClassName, 'group')}
      to={to}
    >
      {content}
    </Link>
  )
}

function HomePage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const nickname = useAuthStore((state) => state.user?.nickname)
  const latestResultId = useSurveyResultStore((state) => state.latestResultId)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const savedRoutineName = useSurveyResultStore((state) => state.savedRoutineName)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)
  const profileResultId = latestResultId ?? undefined

  const resultQuery = useQuery<ProfileData, ApiError>({
    queryKey: queryKeys.profile(profileResultId),
    queryFn: () => apiClient.getProfile(profileResultId),
    enabled: isAuthenticated,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const routinePreviewQuery = useQuery<RoutineListResponse, ApiError>({
    queryKey: queryKeys.routineListPreview(),
    queryFn: () => apiClient.getRoutineList({ size: 1 }),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 0,
  })

  const shouldRedirectToLanding = !isAuthenticated
  const hasExpiredResultError =
    resultQuery.error instanceof ApiError &&
    (resultQuery.error.status === 401 || resultQuery.error.status === 404)

  useEffect(() => {
    if (!hasExpiredResultError) return
    clearLatestResultId()
    clearSavedRoutine()
  }, [hasExpiredResultError, clearLatestResultId, clearSavedRoutine])

  if (shouldRedirectToLanding || hasExpiredResultError) {
    return <Navigate replace to={APP_ROUTES.landing} />
  }

  const result = resultQuery.data
  const diagnosedDate = result ? toYearMonthDay(result.diagnosedAt) : 'YYYY.MM.DD'
  const elapsedDaysLabel = result ? getElapsedDaysLabel(result.diagnosedAt) : 'N일'
  const latestRoutine = routinePreviewQuery.data?.routines[0] ?? null
  const hasRoutine = latestRoutine !== null
  const routineName = savedRoutineName ?? latestRoutine?.title ?? '저장한 루틴'
  const routineTitle = hasRoutine ? `${routineName} 시작하기` : '저장한 루틴이 없어요'
  const amRoutinePath = latestRoutine ? createRoutineDetailPath(latestRoutine.routineGroupId, { tab: 'am' }) : undefined
  const pmRoutinePath = latestRoutine ? createRoutineDetailPath(latestRoutine.routineGroupId, { tab: 'pm' }) : undefined

  return (
    <MobilePage
      className="bg-neutral-50"
      header={<PageHeader showLogo className="bg-neutral-50" />}
      mainClassName="bg-neutral-50 px-0"
    >
      <div className="flex flex-col min-h-[calc(100dvh-48px)]">
        <section className="px-5 pb-5 pt-7">
          <p className="text-[18px] font-medium leading-[25.56px] text-neutral-800">
            {nickname ?? '고객'}님, 마지막 진단으로부터
          </p>
          <div className="mt-1 inline-flex items-center gap-1">
            <span className="text-[24px] font-bold leading-[32.4px] text-primary-400">{elapsedDaysLabel}</span>
            <span className="text-[24px] font-medium leading-[32.4px] text-neutral-800">지났어요.</span>
          </div>
        </section>

        <section className="px-5 pb-4">
          <p className="text-[14px] font-medium leading-[20.44px] text-neutral-600">최근 진단 결과</p>

          {result ? (
            <Link className="mt-4 block rounded-[12px] bg-common-0 p-4" to={createResultDetailPath(result.resultId)}>
              <div className="space-y-1.5">
                <h2 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">{result.skinType}</h2>
                <p className="text-[12px] font-medium leading-[16.32px] text-primary-500">{result.subtitle}</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-normal leading-[16.32px] text-neutral-400">
                <span>{diagnosedDate}</span>
              </div>
            </Link>
          ) : (
            <article className="mt-4 rounded-[12px] bg-common-0 p-4">
              <div className="space-y-1.5">
                <h2 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">최근 진단 정보가 없어요</h2>
                <p className="text-[12px] font-medium leading-[16.32px] text-primary-500">
                  설문을 완료하면 진단 결과를 확인할 수 있어요
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-normal leading-[16.32px] text-neutral-400">
                <span>{diagnosedDate}</span>
              </div>
            </article>
          )}

          <Link
            className="mt-2 inline-flex w-full items-center justify-center rounded-[12px] bg-neutral-800 px-6 py-3 text-[16px] font-medium leading-[23.68px] text-common-0"
            to={APP_ROUTES.survey}
          >
            다시 진단하기
          </Link>
        </section>

        <section className="px-5 py-4">
          <p className="text-[14px] font-semibold leading-[20.44px] text-neutral-600">{routineTitle}</p>
          <div className="mt-4 flex items-stretch gap-3">
            <RoutineQuickStartCard tab="am" title={routineName} to={amRoutinePath} />
            <RoutineQuickStartCard tab="pm" title={routineName} to={pmRoutinePath} />
          </div>
        </section>

        {resultQuery.error && !hasExpiredResultError ? (
          <div className="px-5 pb-4">
            <AlertMessage size="sm" variant="error">
              최근 진단 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </AlertMessage>
          </div>
        ) : null}

        {routinePreviewQuery.error ? (
          <div className="px-5 pb-4">
            <AlertMessage size="sm" variant="error">
              저장한 루틴 정보를 불러오지 못했습니다.
            </AlertMessage>
          </div>
        ) : null}

        <section className="mt-auto bg-neutral-100 px-5 py-4 pb-18">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium leading-[18.2px] text-neutral-600">
              전체 진단 내역과 루틴은
              <br />
              마이페이지에서 확인할 수 있어요!
            </p>
            <Link
              className="inline-flex items-center gap-0.5 px-2 py-2 text-[12px] font-medium leading-[16.32px] text-primary-400"
              to={APP_ROUTES.myPage}
            >
              <span>마이페이지 가기</span>
              <ChevronRight className="size-4" strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      </div>
    </MobilePage>
  )
}

export default HomePage
