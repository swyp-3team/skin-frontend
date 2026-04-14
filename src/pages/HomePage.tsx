import { Link, useLocation } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import PageHeading from '../components/common/PageHeading'
import MobilePage from '../components/MobilePage'
import { Button, buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT, isAuthRedirectState } from '../constants/auth'
import { LANDING_COPY } from '../constants/landing'
import { useLogout } from '../hooks/useLogout'
import { cn } from '../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../stores/authStore'

function HomePage() {
  const location = useLocation()
  const authRedirectState = isAuthRedirectState(location.state) ? location.state : null
  const hasAuthRedirect = authRedirectState !== null

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const loginMock = useAuthStore((state) => state.loginMock)
  const logout = useLogout()

  return (
    <MobilePage>
      <div className="flex min-h-[66dvh] flex-col justify-between">
        <div>
          <PageHeading className="whitespace-pre-line leading-[1.4]">{LANDING_COPY.heroHeadline}</PageHeading>

          {hasAuthRedirect ? (
            <AlertMessage className="mt-6" size="md" variant="warning">
              {authRedirectState?.from ?? AUTH_UI_TEXT.protectedPageFallback}
              {AUTH_UI_TEXT.protectedPageHintSuffix}
            </AlertMessage>
          ) : null}
        </div>

        <div className="space-y-3">
          <Link
            className={cn(
              buttonVariants({ variant: 'cta' }),
              'h-auto w-full rounded-full px-6 py-4 text-center text-xl font-medium shadow-[var(--shadow-cta)]',
            )}
            to={APP_ROUTES.survey}
          >
            {LANDING_COPY.diagnosisStartCta}
          </Link>

          <Button
            className="h-auto w-full rounded-[10px] px-4 py-3 text-sm font-medium"
            onClick={() => {
              if (isAuthenticated) {
                logout()
                return
              }
              loginMock()
            }}
            type="button"
            variant="surface"
          >
            {isAuthenticated ? AUTH_UI_TEXT.mockLogout : AUTH_UI_TEXT.mockLogin}
          </Button>
        </div>
      </div>
    </MobilePage>
  )
}

export default HomePage
