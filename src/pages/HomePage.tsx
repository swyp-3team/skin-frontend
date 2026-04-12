import { Link, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES } from '../app/routes'
import PageHeading from '../components/common/PageHeading'
import MobilePage from '../components/MobilePage'
import { Button, buttonVariants } from '../components/ui/button'
import { isAuthRedirectState } from '../constants/auth'
import { cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'

function HomePage() {
  const location = useLocation()
  const authRedirectState = isAuthRedirectState(location.state) ? location.state : null
  const hasAuthRedirect = authRedirectState !== null

  const { isAuthenticated, loginMock, logoutMock } = useAuthStore(
    useShallow((store) => ({
      isAuthenticated: store.isAuthenticated,
      loginMock: store.loginMock,
      logoutMock: store.logoutMock,
    }))
  )

  return (
    <MobilePage>
      <div className="flex min-h-[66dvh] flex-col justify-between">
        <div>
          <PageHeading className="leading-[1.4] whitespace-pre-line">
            피부 고민을 입력하면{'\n'}나에게 맞는 성분과{'\n'}루틴을 알려드려요
          </PageHeading>

          {hasAuthRedirect ? (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {authRedirectState?.from ?? '보호 페이지'}는 로그인 후 접근할 수 있습니다.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <Link
            className={cn(
              buttonVariants({ variant: 'cta' }),
              'text-xl font-medium h-auto w-full rounded-xl px-6 py-4 text-center shadow-[var(--shadow-cta)]'
            )}
            to={APP_ROUTES.survey}
          >
            피부 진단 시작하기
          </Link>

          <Button
            className="h-auto w-full rounded-[12px] px-4 py-3 text-sm font-medium"
            onClick={() => {
              if (isAuthenticated) {
                logoutMock()
                return
              }
              loginMock()
            }}
            type="button"
            variant="surface"
          >
            {isAuthenticated ? '모의 로그아웃' : '모의 로그인'}
          </Button>
        </div>
      </div>
    </MobilePage>
  )
}

export default HomePage
