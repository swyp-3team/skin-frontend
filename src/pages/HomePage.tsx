import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { ApiError } from '../api/errors'
import { APP_ROUTES, createResultDetailPath } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import PageHeader from '../components/common/PageHeader'
import MobilePage from '../components/MobilePage'
import { cn } from '../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'
import { useSurveyResultStore } from '../stores/surveyResultStore'
import { useResultDetail } from './results/useResultDetail'

function formatDateTime(value: string): { date: string; time: string } {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return { date: 'YYYY.MM.DD', time: '--:--' }
  }

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

function getElapsedDaysLabel(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'N일'
  }

  const today = new Date()
  const diagnosedDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffMs = todayDate.getTime() - diagnosedDate.getTime()
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  return `${days}일`
}

function HomePage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const nickname = useAuthStore((state) => state.user?.nickname)

  const latestResultId = useSurveyResultStore((state) => state.latestResultId)
  const clearLatestResultId = useSurveyResultStore((state) => state.clearLatestResultId)
  const clearSavedRoutine = useSurveyResultStore((state) => state.clearSavedRoutine)

  const resultQuery = useResultDetail(isAuthenticated ? (latestResultId ?? -1) : -1)

  const shouldRedirectToLanding = !isAuthenticated || latestResultId == null
  const hasExpiredResultError =
    resultQuery.error instanceof ApiError &&
    (resultQuery.error.status === 401 || resultQuery.error.status === 404)

  useEffect(() => {
    if (!hasExpiredResultError) {
      return
    }

    clearLatestResultId()
    clearSavedRoutine()
  }, [hasExpiredResultError, clearLatestResultId, clearSavedRoutine])

  if (shouldRedirectToLanding || hasExpiredResultError) {
    return <Navigate replace to={APP_ROUTES.landing} />
  }

  const result = resultQuery.data
  const diagnosed = result ? formatDateTime(result.diagnosedAt) : { date: 'YYYY.MM.DD', time: '--:--' }
  const elapsedDaysLabel = result ? getElapsedDaysLabel(result.diagnosedAt) : 'N일'

  return (
    <MobilePage className="bg-primary-50" header={<PageHeader showLogo className="bg-primary-50" />} mainClassName="px-5 py-4">
      <div className="flex flex-col gap-6 pb-6">
        <section className="space-y-2 pt-2">
          <p className="text-[15px] font-semibold leading-[22.2px] text-neutral-500">
            {nickname ?? '고객'}님 피부 리포트
          </p>
          <h1 className="text-[22px] font-bold leading-[29.7px] text-neutral-800">마지막 진단으로부터</h1>
          <div className="flex items-center gap-1 text-[22px] font-bold leading-[29.7px]">
            <span className="text-primary-400">{elapsedDaysLabel}</span>
            <span className="text-neutral-800">지났어요.</span>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-[14px] font-medium leading-[20.44px] text-neutral-600">최근 진단 결과</p>
          </div>

          <article className="rounded-lg border-t-2 border-primary-400 bg-common-0 px-4 pb-3 pt-4">
            <div className="space-y-1">
              <h2 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">
                {result?.skinType ?? '최근 진단 정보를 불러오는 중입니다.'}
              </h2>
              <p className="text-[12px] font-medium leading-[16.32px] text-primary-500">
                {result?.subtitle ?? '잠시만 기다려주세요.'}
              </p>
            </div>

            <div className="mt-4 border-b border-neutral-100 py-2">
              <div className="inline-flex items-center gap-1 text-[12px] font-normal leading-[16.32px] text-neutral-400">
                <span>{diagnosed.date}</span>
                <span>{diagnosed.time}</span>
              </div>
            </div>

            <div className="mt-1 flex justify-end">
              {result ? (
                <Link
                  className="inline-flex items-center gap-0.5 px-2 py-2 text-[12px] font-medium leading-[16.32px] text-primary-400"
                  to={createResultDetailPath(latestResultId)}
                >
                  결과보기
                  <ChevronRight className="size-4" strokeWidth={1.8} />
                </Link>
              ) : null}
            </div>
          </article>

          <Link
            className="inline-flex h-[40px] w-full items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 px-5 py-[9px] text-[15px] font-medium leading-[22.2px] text-neutral-600"
            to={APP_ROUTES.survey}
          >
            다시 진단하기
          </Link>
        </section>

        {resultQuery.error && !hasExpiredResultError ? (
          <AlertMessage size="sm" variant="error">
            최근 진단 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </AlertMessage>
        ) : null}

        <section className="pt-1">
          <div className="flex items-center justify-between rounded-lg bg-common-0 p-4">
            <p className="text-[14px] font-medium leading-[20.44px] text-neutral-600">
              전체 진단 내역과 루틴은
              <br />
              마이페이지에서 확인할 수 있어요!
            </p>
            <Link
              className={cn(
                'inline-flex items-center gap-0.5 px-2 py-2 text-[12px] font-medium leading-[16.32px] text-primary-400',
              )}
              to={APP_ROUTES.myPage}
            >
              마이페이지 가기
              <ChevronRight className="size-4" strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      </div>
    </MobilePage>
  )
}

export default HomePage
