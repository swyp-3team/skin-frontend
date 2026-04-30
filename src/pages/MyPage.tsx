import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiClient } from '../api'
import { ApiError } from '../api/errors'
import type { ResultListResponse, RoutineListResponse } from '../api/types'
import { APP_ROUTES, createResultDetailPath } from '../app/routes'
import ConfirmActionDialog from '../components/common/ConfirmActionDialog'
import SectionTitle from '../components/common/SectionTitle'
import SurfaceCard from '../components/common/SurfaceCard'
import MobilePage from '../components/MobilePage'
import PageHeader from '../components/common/PageHeader'
import { buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT } from '../constants/auth'

import { useLogout } from '../hooks/useLogout'
import { toDateTimeDisplay, toYearMonthDay } from '../lib/dateDisplay'
import { notify } from '../lib/notify'
import { queryKeys } from '../lib/queryKeys'
import { cn } from '../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'

type MyPageViewState = 'diagnosis_routine' | 'diagnosis_only' | 'empty'
const MAX_VISIBLE_HISTORY_COUNT = 3
const CARD_BOTTOM_ACTION_CLASS =
  'inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-neutral-300'


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

function MyPage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false)

  const savedRoutineName = useSurveyResultStore((state) => state.savedRoutineName)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)

  const routineQuery = useQuery<RoutineListResponse, ApiError>({
    queryKey: queryKeys.routineListPreview(),
    queryFn: () => apiClient.getRoutineList({ size: 1 }),
    enabled: isAuthenticated === true,
    staleTime: 0,
    retry: false,
  })

  const resultListQuery = useQuery<ResultListResponse, ApiError>({
    queryKey: queryKeys.resultListPreview(),
    queryFn: () => apiClient.getResultList({ size: MAX_VISIBLE_HISTORY_COUNT }),
    enabled: isAuthenticated === true,
    staleTime: 0,
    retry: false,
  })

  const shouldResetByRoutineError = shouldResetByError(routineQuery.error ?? null)

  useEffect(() => {
    if (!shouldResetByRoutineError) return
    clearSavedRoutine()
  }, [shouldResetByRoutineError, clearSavedRoutine])

  const hasResultFromApi = (resultListQuery.data?.results.length ?? 0) > 0
  const hasRoutineFromApi = (routineQuery.data?.routines.length ?? 0) > 0

  let viewState: MyPageViewState = 'empty'
  if (hasResultFromApi && hasRoutineFromApi && !shouldResetByRoutineError) {
    viewState = 'diagnosis_routine'
  } else if (hasResultFromApi) {
    viewState = 'diagnosis_only'
  }

  const latestRoutine = routineQuery.data?.routines[0]
  const routineName = savedRoutineName ?? latestRoutine?.title ?? '저장한 루틴'
  const routineDate = latestRoutine ? toYearMonthDay(latestRoutine.createdAt) : 'YYYY.MM.DD'
  const hasRoutinePreview = hasRoutineFromApi
  const resultItems = (resultListQuery.data?.results ?? []).slice(0, MAX_VISIBLE_HISTORY_COUNT)

  function handleWithdrawalClick() {
    setIsWithdrawalDialogOpen(true)
  }

  function handleWithdrawalConfirm() {
    setIsWithdrawalDialogOpen(false)
    notify.info('회원탈퇴 기능은 준비중입니다.')
  }

  return (
    <MobilePage
      header={<PageHeader title="마이페이지" className="bg-neutral-50" />}
      mainClassName="bg-neutral-50 px-5 py-5"
    >
      <section className="space-y-5 pb-8">
        <SurfaceCard className="rounded-[12px] bg-common-0 p-4">
          <p className="text-base font-semibold leading-[23.68px] text-neutral-800">
            {user?.nickname ?? AUTH_UI_TEXT.defaultNickname}
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-[12px] bg-common-0 p-4">
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
                <article className="flex w-full flex-col gap-4 rounded-[8px] bg-primary-200 p-4">
                  <p className="text-[15px] font-semibold leading-[22.2px] text-neutral-900">{routineName}</p>
                  <p className="text-[11px] font-medium leading-[14.3px] text-neutral-400">{routineDate}</p>
                </article>

                {hasRoutinePreview ? (
                  <div className="flex w-full justify-center">
                    <Link className={CARD_BOTTOM_ACTION_CLASS} to={APP_ROUTES.myPageRoutines}>
                      <span>전체보기</span>
                      <ChevronRight className="size-4" strokeWidth={1.8} />
                    </Link>
                  </div>
                ) : null}
              </div>
            )
          ) : (
            <div className="space-y-4 rounded-[8px] border border-neutral-150 px-2.5 py-6 text-center">
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

        <SurfaceCard className="space-y-4 rounded-[12px] bg-common-0 p-4">
          <SectionTitle>피부 진단 내역</SectionTitle>

          {viewState === 'empty' ? (
            <div className="space-y-4 rounded-[8px] border border-neutral-150 px-2.5 py-6 text-center">
              <p className="whitespace-pre-line text-sm leading-[20.44px] text-neutral-400">
                진단 이력이 없어요.<br />피부 진단을 시작해 보세요.
              </p>
              <Link
                className={cn(buttonVariants({ variant: 'dark' }), 'h-auto rounded-lg px-4 py-1.5 text-sm')}
                to={APP_ROUTES.survey}
              >
                피부 진단하기
              </Link>
            </div>
          ) : resultListQuery.isLoading ? (
            <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
              진단 이력을 불러오는 중입니다.
            </p>
          ) : resultListQuery.error ? (
            <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
              진단 이력을 불러오지 못했습니다.
            </p>
          ) : resultItems.length > 0 ? (
            <div className="space-y-3">
              <ul>
                {resultItems.map((resultItem) => {
                  const historyDateTime = toDateTimeDisplay(resultItem.diagnosedAt)
                  return (
                    <HistoryRow
                      key={resultItem.resultId}
                      date={historyDateTime.date}
                      resultDetailPath={createResultDetailPath(resultItem.resultId)}
                      time={historyDateTime.time}
                      title={resultItem.title}
                    />
                  )
                })}
              </ul>
              <div className="flex w-full justify-center">
                <Link className={CARD_BOTTOM_ACTION_CLASS} to={APP_ROUTES.myPageResults}>
                  <span>전체보기</span>
                  <ChevronRight className="size-4" strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-neutral-150 px-3 py-6 text-center text-sm text-neutral-400">
              진단 이력이 없어요.
            </p>
          )}
        </SurfaceCard>

        <button
          className="inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-common-0 px-6 py-3 text-base font-semibold leading-[23.68px] text-neutral-600"
          onClick={logout}
          type="button"
        >
          로그아웃
        </button>

        <div className="space-y-2 py-7">
          <p className="text-sm font-medium leading-[20.44px] text-neutral-900">회원 탈퇴</p>
          <p className="text-xs font-medium leading-[16.32px] text-neutral-400">
            탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
          <div className="flex w-full justify-center">
            <button
              className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium leading-[16.32px] text-red-400 opacity-70"
              onClick={handleWithdrawalClick}
              type="button"
            >
              <span>탈퇴하기</span>
              <ChevronRight className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </section>

      <ConfirmActionDialog
        description="탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다. 탈퇴하시겠습니까?"
        onConfirm={handleWithdrawalConfirm}
        onOpenChange={setIsWithdrawalDialogOpen}
        open={isWithdrawalDialogOpen}
        title="회원탈퇴 확인"
      />
    </MobilePage>
  )
}

export default MyPage
