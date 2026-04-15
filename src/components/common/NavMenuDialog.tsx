import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { APP_ROUTES, createResultProductsPath, createResultRoutinePath } from '@/app/routes'
import AlertMessage from '@/components/common/AlertMessage'
import { Button } from '@/components/ui/button'
import { DrawerClose, DrawerContent, DrawerRoot, DrawerTrigger } from '@/components/ui/drawer'
import { useLogout } from '@/hooks/useLogout'
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore'
import { useSurveyStore } from '@/stores/surveyStore'

// ─── 메뉴 액션 타입 ──────────────────────────────────────────────────────────

type MenuAction =
  | { type: 'navigate'; path: string }
  | { type: 'alert'; message: string }

type MenuItemConfig = {
  label: string
  resolveAction: (isAuthenticated: boolean, latestResultId: number | null) => MenuAction
}

// ─── 상수 ────────────────────────────────────────────────────────────────────

const ALERT_MESSAGES = {
  loginRequired: '로그인 후 이용할 수 있어요.',
  surveyRequired: '먼저 피부 진단을 받아보세요.',
} as const

// 실제 인증 구현 시 authStore의 email 필드로 교체
const MOCK_USER_EMAIL = 'layerd@gmail.com'

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

// 로그인 + 설문 결과가 모두 있어야 접근 가능한 메뉴 아이템의 resolveAction 생성
function createAuthGuardedAction(getPath: (id: number) => string): MenuItemConfig['resolveAction'] {
  return (isAuthenticated, latestResultId) => {
    if (!isAuthenticated) return { type: 'alert', message: ALERT_MESSAGES.loginRequired }
    if (!latestResultId) return { type: 'alert', message: ALERT_MESSAGES.surveyRequired }
    return { type: 'navigate', path: getPath(latestResultId) }
  }
}

const MENU_ITEMS: MenuItemConfig[] = [
  {
    label: '피부 진단하기',
    resolveAction: () => ({ type: 'navigate', path: APP_ROUTES.survey }),
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

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

interface UserAvatarProps {
  nickname: string | undefined
  // 추후 사진 추가 시: avatarUrl?: string
}

function UserAvatar({ nickname }: UserAvatarProps) {
  return (
    <div className="size-[49px] shrink-0 overflow-hidden rounded-full bg-[#EDEEED] flex items-center justify-center text-sm font-medium text-[#1A1C18]">
      {/* avatarUrl 생기면 아래 주석 해제 후 이니셜 제거:
          <img src={avatarUrl} alt={nickname} className="size-full object-cover" /> */}
      {nickname?.charAt(0) ?? '?'}
    </div>
  )
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

function NavMenuDialog() {
  const [open, setOpen] = useState(false)
  const [inlineAlert, setInlineAlert] = useState<string | null>(null)

  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const nickname = useAuthStore((s) => s.nickname)
  const latestResultId = useSurveyStore((s) => s.latestResultId)
  const logout = useLogout()
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
    navigate(APP_ROUTES.survey)
  }

  function handleLogout() {
    handleOpenChange(false)
    logout()
  }

  return (
    <DrawerRoot direction="top" open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger
        aria-label="메뉴 열기"
        className="flex items-center justify-center rounded text-[#767774] transition-colors hover:text-slate-900"
      >
        <Menu size={24} />
      </DrawerTrigger>

      <DrawerContent
        aria-label="네비게이션 메뉴"
        className="h-[80dvh] px-6 border-none shadow-[0_7px_10px_rgba(0,0,0,0.07)]"
      >
        {/* 상단: X 닫기 버튼 */}
        <div className="flex h-13 shrink-0 items-center justify-end">
          <DrawerClose
            aria-label="메뉴 닫기"
            className="flex items-center justify-center rounded p-1 text-[#767774] transition-colors hover:text-slate-900"
          >
            <X size={24} />
          </DrawerClose>
        </div>

        {/* 헤더: 비로그인 / 로그인 분기 */}
        <div className="shrink-0 pb-12 pt-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <UserAvatar nickname={nickname} />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[#1A1C18]">[ {nickname} ]</span>
                <span className="text-xs text-[#1A1C18]">{MOCK_USER_EMAIL}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="group flex w-full items-center justify-between pr-3"
              onClick={handleLoginClick}
            >
              <span className="text-xl font-bold text-[#1A1C18]">로그인하기</span>
              <ArrowRight
                size={20}
                className="text-[#1A1C18] transition-transform group-hover:translate-x-0.5"
              />
            </button>
          )}
        </div>

        {/* 메뉴 섹션 */}
        <div className="flex min-h-0 flex-1 flex-col mr-3">
          <p className="mb-2 text-sm text-[#5A5F5D]">메뉴</p>
          <div className="border-t border-[#5A5F5D]" />
          <ul className="flex flex-col pt-5 gap-3">
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="w-full rounded-lg py-3 pl-1 text-left text-sm text-[#1A1C18] transition-colors hover:bg-[#F8F9F7] active:bg-[#F8F9F7]"
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

        {/* 푸터: 로그인 상태일 때만 표시 */}
        {isAuthenticated && (
          <div className="shrink-0 py-5">
            <Button
              className="h-10 rounded-[10px] bg-[#F8F9F7] border-[#EDEEED]"
              onClick={handleLogout}
              size="page"
              type="button"
              variant="surface"
            >
              로그아웃
            </Button>
          </div>
        )}
      </DrawerContent>
    </DrawerRoot>
  )
}

export default NavMenuDialog
