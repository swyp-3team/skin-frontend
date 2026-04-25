import { useState } from 'react'
import { X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { APP_ROUTES, createResultProductsPath, createResultRoutinePath } from '@/app/routes'
import menuIcon from '@/assets/icons/mobile-page/menu.svg'
import AlertMessage from '@/components/common/AlertMessage'
import LoginDialog from '@/components/survey/LoginDialog'
import { Button } from '@/components/ui/button'
import { DrawerClose, DrawerContent, DrawerRoot, DrawerTrigger } from '@/components/ui/drawer'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/utils'
import { saveIntent } from '@/auth/postLoginIntent'
import { buildOAuthStartUrl } from '@/auth/oauthStartUrl'
import type { OAuthProvider } from '@/constants/auth'
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore'
import { useSurveyResultStore } from '@/stores/surveyResultStore'
import { AUTH_UI_TEXT } from '@/constants/auth'

type MenuAction =
  | { type: 'navigate'; path: string }
  | { type: 'alert'; message: string }

type MenuItemConfig = {
  label: string
  resolveAction: (isAuthenticated: boolean, latestResultId: number | null) => MenuAction
}

const ALERT_MESSAGES = {
  loginRequired: '로그인 후 이용해주세요',
  surveyRequired: '먼저 피부 진단을 받아보세요',
} as const

function createAuthGuardedAction(getPath: (id: number) => string): MenuItemConfig['resolveAction'] {
  return (isAuthenticated, latestResultId) => {
    if (!isAuthenticated) return { type: 'alert', message: ALERT_MESSAGES.loginRequired }
    if (!latestResultId) return { type: 'alert', message: ALERT_MESSAGES.surveyRequired }
    return { type: 'navigate', path: getPath(latestResultId) }
  }
}

function createLoginRequiredAction(path: string): MenuItemConfig['resolveAction'] {
  return (isAuthenticated) => {
    if (!isAuthenticated) return { type: 'alert', message: ALERT_MESSAGES.loginRequired }
    return { type: 'navigate', path }
  }
}

const MENU_ITEMS: MenuItemConfig[] = [
  {
    label: '피부 진단하기',
    resolveAction: () => ({ type: 'navigate', path: APP_ROUTES.survey }),
  },
  {
    label: '마이페이지',
    resolveAction: createLoginRequiredAction(APP_ROUTES.myPage),
  },
  {
    label: '루틴 추천받기',
    resolveAction: createAuthGuardedAction(createResultRoutinePath),
  },
  {
    label: '제품 추천받기',
    resolveAction: createAuthGuardedAction(createResultProductsPath),
  },
]

interface UserAvatarProps {
  nickname: string | undefined
}

function UserAvatar({ nickname }: UserAvatarProps) {
  return (
    <div className="size-[49px] shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-800">
      {nickname?.charAt(0) ?? '?'}
    </div>
  )
}

interface NavMenuDialogProps {
  triggerClassName?: string
}

function NavMenuDialog({ triggerClassName }: NavMenuDialogProps) {
  const [open, setOpen] = useState(false)
  const [inlineAlert, setInlineAlert] = useState<string | null>(null)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const nickname = useAuthStore((s) => s.user?.nickname)
  const latestResultId = useSurveyResultStore((s) => s.latestResultId)
  const logout = useLogout()
  const location = useLocation()
  const navigate = useNavigate()

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setInlineAlert(null)
    setOpen(nextOpen)
  }

  function handleItemClick(item: MenuItemConfig) {
    const action = item.resolveAction(isAuthenticated, latestResultId)
    if (action.type === 'alert') {
      setInlineAlert(action.message)
      return
    }

    handleOpenChange(false)
    navigate(action.path)
  }

  function handleLoginClick() {
    handleOpenChange(false)
    setLoginDialogOpen(true)
  }

  function handleLogin(provider: OAuthProvider) {
    const intent =
      location.pathname === APP_ROUTES.surveyResult
        ? { type: 'promote-preview' as const }
        : { type: 'return' as const, returnTo: location.pathname }
    saveIntent(intent)
    window.location.href = buildOAuthStartUrl(provider)
  }

  function handleLogout() {
    handleOpenChange(false)
    logout()
  }

  return (
    <>
      <DrawerRoot direction="top" open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger
          aria-label="메뉴 열기"
          className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded', triggerClassName)}
        >
          <img alt="" aria-hidden className="size-7" src={menuIcon} />
        </DrawerTrigger>

        <DrawerContent
          aria-label="네비게이션 메뉴"
          className="h-[80dvh] overflow-hidden border-none px-5 shadow-[0_7px_10px_rgba(0,0,0,0.07)]"
        >
          <div className="flex h-13 shrink-0 items-center justify-end">
            <DrawerClose
              aria-label="메뉴 닫기"
              className="flex items-center justify-center rounded p-1 text-neutral-400 transition-colors hover:text-neutral-800"
            >
              <X size={24} />
            </DrawerClose>
          </div>

          <div className="shrink-0 pb-12 pt-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <UserAvatar nickname={nickname} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-neutral-800">{nickname ?? AUTH_UI_TEXT.defaultNickname}</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="group flex w-full items-center justify-between pr-3"
                onClick={handleLoginClick}
              >
                <span className="text-2xl font-bold text-neutral-800">로그인하기</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-neutral-800 transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M14 5L21 12L14 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          <div className="mr-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
            <p className="mb-2 text-sm font-medium text-neutral-500">메뉴</p>
            <div className="border-t border-neutral-500" />
            <ul className="flex flex-col pt-5 gap-3">
              {MENU_ITEMS.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="w-full rounded-xl p-2 text-left text-lg font-medium text-neutral-800 transition-colors hover:bg-neutral-50 active:bg-neutral-50"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {inlineAlert !== null && (
              <div className="pt-4">
                <AlertMessage size="sm" variant="info">
                  {inlineAlert}
                </AlertMessage>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <div className="shrink-0 py-5">
              <Button
                className="h-10 rounded-[10px] bg-neutral-50 border-neutral-100"
                onClick={handleLogout}
                size="page"
                type="button"
                variant="tertiary"
              >
                로그아웃
              </Button>
            </div>
          )}
        </DrawerContent>
      </DrawerRoot>

      <LoginDialog
        isPromoting={false}
        onLogin={handleLogin}
        onOpenChange={setLoginDialogOpen}
        open={loginDialogOpen}
        variant="default"
      />
    </>
  )
}

export default NavMenuDialog
