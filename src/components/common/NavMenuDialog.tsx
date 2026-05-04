import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { saveIntent } from '@/auth/postLoginIntent'
import { buildOAuthStartUrl } from '@/auth/oauthStartUrl'
import { APP_ROUTES, createResultProductsPath, createResultRoutinePath } from '@/app/routes'
import menuIcon from '@/assets/icons/mobile-page/menu.svg'
import AlertMessage from '@/components/common/AlertMessage'
import LoginDialog from '@/components/common/LoginDialog'
import { Button } from '@/components/ui/button'
import { DrawerClose, DrawerContent, DrawerRoot, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { AUTH_UI_TEXT } from '@/constants/auth'
import type { LoginDialogVariant, OAuthProvider } from '@/constants/auth'
import { SURVEY_INTRO_ENTRY_POINTS } from '@/constants/surveyEntry'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/utils'
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore'
import { useSurveyProgressStore } from '@/stores/surveyProgressStore'
import { useSurveyResultStore } from '@/stores/surveyResultStore'

type MenuAction =
  | { type: 'navigate'; path: string }
  | { type: 'alert'; message: string }

type MenuItemId = 'home' | 'survey' | 'routine' | 'products' | 'myPage'

type MenuItemConfig = {
  id: MenuItemId
  label: string
  resolveAction: (isAuthenticated: boolean, latestResultId: number | null) => MenuAction
}

const ALERT_MESSAGES = {
  loginRequired: '로그인 후 이용해 주세요.',
  surveyRequired: '먼저 피부 진단을 받아보세요.',
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
    id: 'home',
    label: '홈',
    resolveAction: () => ({ type: 'navigate', path: APP_ROUTES.home }),
  },
  {
    id: 'survey',
    label: '피부 진단하기',
    resolveAction: () => ({ type: 'navigate', path: APP_ROUTES.surveySteps }),
  },
  {
    id: 'routine',
    label: '루틴 추천받기',
    resolveAction: createAuthGuardedAction(createResultRoutinePath),
  },
  {
    id: 'products',
    label: '제품 추천받기',
    resolveAction: createAuthGuardedAction(createResultProductsPath),
  },
  {
    id: 'myPage',
    label: '마이페이지',
    resolveAction: createLoginRequiredAction(APP_ROUTES.myPage),
  },
]

interface UserAvatarProps {
  nickname: string | undefined
}

function UserAvatar({ nickname }: UserAvatarProps) {
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-800">
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
  const [loginDialogVariant, setLoginDialogVariant] = useState<LoginDialogVariant>('default')
  const portalContainer =
    typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('[data-mobile-portal]')

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const nickname = useAuthStore((s) => s.user?.nickname)
  const latestResultId = useSurveyResultStore((s) => s.latestResultId)
  const hasPreviewResult = useSurveyProgressStore((s) => s.previewResult !== null)
  const logout = useLogout()
  const location = useLocation()
  const navigate = useNavigate()

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setInlineAlert(null)
    setOpen(nextOpen)
  }

  function handleItemClick(item: MenuItemConfig) {
    if (item.id === 'routine' || item.id === 'products') {
      if (!isAuthenticated) {
        handleOpenChange(false)
        setLoginDialogVariant(location.pathname === APP_ROUTES.surveyResult && hasPreviewResult ? 'result' : 'default')
        setLoginDialogOpen(true)
        return
      }

      if (latestResultId == null) {
        handleOpenChange(false)
        navigate(APP_ROUTES.survey, {
          state: {
            surveyEntryPoint:
              item.id === 'routine' ? SURVEY_INTRO_ENTRY_POINTS.routine : SURVEY_INTRO_ENTRY_POINTS.products,
          },
        })
        return
      }
    }

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
    setLoginDialogVariant('default')
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
      <DrawerRoot direction="right" open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger
          aria-label="메뉴 열기"
          className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded', triggerClassName)}
        >
          <img alt="" aria-hidden className="size-7" src={menuIcon} />
        </DrawerTrigger>

        <DrawerContent
          aria-label="내비게이션 메뉴"
          className="absolute top-0 right-0 h-full w-[286px] max-w-[calc(100%-48px)] translate-x-0 overflow-hidden border-none pointer-events-auto"
          container={portalContainer}
          overlayClassName="fixed inset-0 pointer-events-auto bg-common-1000/50"
          style={{ left: 'unset', boxShadow: '-2px 0 0 0 white, 2px 0 0 0 white' }}
        >
          <DrawerTitle className="sr-only">내비게이션 메뉴</DrawerTitle>

          <div className="flex h-12 shrink-0 items-center justify-end px-2.5">
            <DrawerClose
              aria-label="메뉴 닫기"
              className="flex size-11 items-center justify-center rounded-lg text-neutral-800 transition-colors hover:bg-neutral-50 active:bg-neutral-50"
            >
              <X size={24} />
            </DrawerClose>
          </div>

          <div className="shrink-0 px-5 pb-10 pt-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <UserAvatar nickname={nickname} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[18px] font-bold leading-[27.6px] text-neutral-800">
                    {nickname ?? AUTH_UI_TEXT.defaultNickname}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="group flex w-full items-center justify-between py-2"
                onClick={handleLoginClick}
              >
                <span className="text-[20px] font-bold leading-[27.6px] text-neutral-800">로그인하기</span>
                <ChevronRight
                  aria-hidden
                  className="text-neutral-800 transition-transform group-hover:translate-x-0.5"
                  size={24}
                  strokeWidth={1.6}
                />
              </button>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5">
            <div className="flex flex-col gap-3">
              <p className="text-[14px] font-medium leading-[20.44px] text-neutral-500">메뉴</p>
              <div className="h-px bg-neutral-200" />
            </div>
            <ul className="flex flex-col gap-4 pt-4">
              {MENU_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-[16px] font-medium leading-[23.68px] text-neutral-800 transition-colors hover:bg-neutral-50 active:bg-neutral-50"
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
            <div className="shrink-0 pb-10 px-4">
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
        variant={loginDialogVariant}
      />
    </>
  )
}

export default NavMenuDialog
