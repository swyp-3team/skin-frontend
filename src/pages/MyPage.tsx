import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import type { ResultDetail, RoutineGroup } from '../api/types'
import { APP_ROUTES, createResultDetailPath, createRoutineDetailPath } from '../app/routes'
import SectionTitle from '../components/common/SectionTitle'
import SurfaceCard from '../components/common/SurfaceCard'
import MobilePage from '../components/MobilePage'
import PageHeader from '../components/common/PageHeader'
import { buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT } from '../constants/auth'

import { useLogout } from '../hooks/useLogout'
import { queryKeys } from '../lib/queryKeys'
import { cn } from '../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'
import { getResultDetailQueryOptions } from './results/useResultDetail'

type MyPageViewState = 'diagnosis_routine' | 'diagnosis_only' | 'empty'

const PLACEHOLDER_HISTORY_TITLE = '피부 진단 결과'

interface HistoryRowProps {
  date: string
  time: string
  title: string
  resultDetailPath?: string
}

function HistoryRow({ date, time, title, resultDetailPath }: HistoryRowProps) {
  return (
    <li className="flex items-start justify-between border-b border-neutral-100 py-2">
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm leading-[20.44px] text-neutral-600">
          <span>{date}</span>
          <span className="text-neutral-300">{time}</span>
        </div>
        <p className="text-xs leading-[16.32px] text-neutral-300">{title}</p>
      </div>

      {resultDetailPath ? (
        <Link
          className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-neutral-300"
          to={resultDetailPath}
        >
          <span>결과보기</span>
          <ChevronRight className="size-4" strokeWidth={1.8} />
        </Link>
      ) : null}
    </li>
  )
}

function shouldResetByError(error: ApiError | null): boolean {
  if (!error) return false
  return error.status === 401 || error.status === 404
}

function toDateTimeDisplay(value: string): { date: string; time: string } {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    const hour = String(parsed.getHours()).padStart(2, '0')
    const minute = String(parsed.getMinutes()).padStart(2, '0')

    return {
      date: `${year}.${month}.${day}`,
      time: `${hour}:${minute}`,
    }
  }

  const matchedDate = value.match(/^(\d{4})[./-](\d{2})[./-](\d{2})(?:\s+(\d{2}):(\d{2}))?$/)
  if (matchedDate) {
    const [, year, month, day, hour, minute] = matchedDate
    return {
      date: `${year}.${month}.${day}`,
      time: hour && minute ? `${hour}:${minute}` : '--:--',
    }
  }

  return { date: 'YYYY.MM.DD', time: 'HH:MM' }
}

function toMonthDay(value: string): string {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${month}.${day}`
  }

  const matchedDate = value.match(/^\d{4}[./-](\d{2})[./-](\d{2})/)
  if (matchedDate) {
    return `${matchedDate[1]}.${matchedDate[2]}`
  }

  return 'MM.DD'
}

function MyPage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()

  const latestResultId = useSurveyResultStore((state) => state.latestResultId)
  const savedResultId = useSurveyResultStore((state) => state.savedResultId)
  const savedRoutineName = useSurveyResultStore((state) => state.savedRoutineName)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)

  const resultQuery = useQuery<ResultDetail, ApiError>(getResultDetailQueryOptions(latestResultId ?? -1, accessToken))

  const shouldResetByResultError = shouldResetByError(resultQuery.error ?? null)

  useEffect(() => {
    if (!shouldResetByResultError) return
    clearLatestResultId()
    clearSavedRoutine()
  }, [shouldResetByResultError, clearLatestResultId, clearSavedRoutine])

  const hasSavedRoutine = latestResultId != null && savedResultId === latestResultId
  const hasDiagnosis = resultQuery.data !== undefined || (latestResultId != null && !shouldResetByResultError)

  const routineQuery = useQuery<RoutineGroup, ApiError>({
    queryKey: queryKeys.resultRoutine(latestResultId ?? -1),
    queryFn: () => apiClient.getRoutineGroup(latestResultId!, { accessToken }),
    enabled: isAuthenticated && latestResultId != null && hasDiagnosis && hasSavedRoutine,
    retry: false,
  })

  const shouldResetByRoutineError = shouldResetByError(routineQuery.error ?? null)

  useEffect(() => {
    if (!shouldResetByRoutineError) return
    clearSavedRoutine()
  }, [shouldResetByRoutineError, clearSavedRoutine])

  let viewState: MyPageViewState = 'empty'
  if (hasDiagnosis && hasSavedRoutine && !shouldResetByRoutineError) {
    viewState = 'diagnosis_routine'
  } else if (hasDiagnosis) {
    viewState = 'diagnosis_only'
  }

  const summary = resultQuery.data
  const historyDateTime = summary ? toDateTimeDisplay(summary.diagnosedAt) : null

  const routineName = savedRoutineName ?? routineQuery.data?.title ?? '저장한 루틴'
  const routineDate = routineQuery.data ? toMonthDay(routineQuery.data.createdAt) : 'MM.DD'
  const routineDetailPath = routineQuery.data ? createRoutineDetailPath(routineQuery.data.routineGroupId) : null

  return (
    <MobilePage
      header={<PageHeader title="마이페이지" className="bg-neutral-50" />}
      mainClassName="bg-neutral-50 px-5 py-5"
    >
      <section className="space-y-5 pb-8">
        <SurfaceCard className="rounded-xl bg-common-0 p-4">
          <p className="text-base font-semibold leading-[23.68px] text-neutral-800">
            {user?.nickname ?? AUTH_UI_TEXT.defaultNickname}
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-xl bg-common-0 p-4">
          <SectionTitle>나의 루틴</SectionTitle>

          {viewState === 'diagnosis_routine' ? (
            routineQuery.isLoading ? (
              <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
                루틴 정보를 불러오는 중입니다.
              </p>
            ) : routineQuery.error ? (
              <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
                루틴 정보를 불러오지 못했습니다.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <article className="flex h-[108px] flex-col justify-between rounded-lg bg-primary-200 p-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium leading-[14.3px] text-neutral-800">아침</p>
                      <p className="text-sm font-medium leading-[20.44px] text-neutral-900">{routineName}</p>
                    </div>
                    <p className="text-[11px] font-medium leading-[14.3px] text-neutral-400">{routineDate}</p>
                  </article>

                  <article className="flex h-[108px] flex-col justify-between rounded-lg bg-neutral-500 p-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium leading-[14.3px] text-common-0">저녁</p>
                      <p className="text-sm font-medium leading-[20.44px] text-common-0">{routineName}</p>
                    </div>
                    <p className="text-[11px] font-medium leading-[14.3px] text-neutral-200">{routineDate}</p>
                  </article>
                </div>

                {routineDetailPath ? (
                  <Link
                    className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-neutral-300"
                    to={routineDetailPath}
                  >
                    <span>전체보기</span>
                    <ChevronRight className="size-4" strokeWidth={1.8} />
                  </Link>
                ) : null}
              </div>
            )
          ) : (
            <div className="space-y-4 rounded-lg border border-neutral-150 px-2.5 py-6 text-center">
              <p className="whitespace-pre-line text-sm leading-[20.44px] text-neutral-400">
                {viewState === 'diagnosis_only'
                  ? '저장된 루틴이 없어요.\n루틴 추천 결과를 저장해 보세요.'
                  : '피부 진단 받고 루틴을 저장해 보세요.'}
              </p>
              <Link
                className={cn(buttonVariants({ variant: 'dark' }), 'h-auto rounded-lg px-4 py-1.5 text-sm')}
                to={APP_ROUTES.survey}
              >
                피부 진단하기
              </Link>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-xl bg-common-0 p-4">
          <SectionTitle>피부 진단 이력</SectionTitle>

          {viewState === 'empty' ? (
            <div className="space-y-4 rounded-lg border border-neutral-150 px-2.5 py-6 text-center">
              <p className="whitespace-pre-line text-sm leading-[20.44px] text-neutral-400">
                진단 이력이 없어요.\n피부 진단을 시작해 보세요.
              </p>
              <Link
                className={cn(buttonVariants({ variant: 'dark' }), 'h-auto rounded-lg px-4 py-1.5 text-sm')}
                to={APP_ROUTES.survey}
              >
                피부 진단하기
              </Link>
            </div>
          ) : resultQuery.isLoading ? (
            <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
              진단 이력을 불러오는 중입니다.
            </p>
          ) : resultQuery.error ? (
            <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
              진단 이력을 불러오지 못했습니다.
            </p>
          ) : summary && historyDateTime ? (
            <ul>
              <HistoryRow
                date={historyDateTime.date}
                resultDetailPath={latestResultId != null ? createResultDetailPath(latestResultId) : undefined}
                time={historyDateTime.time}
                title={summary.skinType}
              />
              <HistoryRow date="YYYY.MM.DD" time="HH:MM" title={PLACEHOLDER_HISTORY_TITLE} />
              <HistoryRow date="YYYY.MM.DD" time="HH:MM" title={PLACEHOLDER_HISTORY_TITLE} />
            </ul>
          ) : (
            <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
              진단 이력을 불러오지 못했습니다.
            </p>
          )}
        </SurfaceCard>

        <button
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600"
          onClick={logout}
          type="button"
        >
          로그아웃
        </button>

        <div className="space-y-2 py-5">
          <p className="text-sm font-medium leading-[20.44px] text-neutral-900">회원 탈퇴</p>
          <p className="text-xs font-medium leading-[16.32px] text-neutral-400">
            탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
          <button
            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-red-400 opacity-70 disabled:cursor-not-allowed"
            disabled
            type="button"
          >
            <span>탈퇴하기</span>
            <ChevronRight className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      </section>
    </MobilePage>
  )
}

export default MyPage
