import { X } from 'lucide-react'

import AppLogo from '@/components/icons/AppLogo'
import GoogleLogo from '@/components/icons/GoogleLogo'
import KakaoLogo from '@/components/icons/KakaoLogo'
import { DrawerClose, DrawerContentBottom, DrawerRoot } from '@/components/ui/drawer'
import { AUTH_PROVIDERS, AUTH_UI_TEXT, LOGIN_DIALOG_COPY } from '@/constants/auth'
import type { LoginDialogVariant } from '@/constants/auth'
import { Button } from '../ui/button'

interface LoginDialogProps {
  open: boolean
  variant: LoginDialogVariant
  isPromoting: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (providerLabel: string) => void
}

function LoginDialog({ open, variant, isPromoting, onOpenChange, onLogin }: LoginDialogProps) {
  const copy = LOGIN_DIALOG_COPY[variant]

  return (
    <DrawerRoot open={open} onOpenChange={onOpenChange}>
      <DrawerContentBottom aria-label="로그인" className="min-h-[90dvh]">
        {/* 닫기 버튼 행 */}
        <div className="flex shrink-0 items-center justify-end p-3">
          <DrawerClose
            aria-label="닫기"
            className="flex items-center justify-center rounded-2xl bg-neutral-50 p-2 text-neutral-800 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </DrawerClose>
        </div>

        {/* 콘텐츠 — flex-1로 남은 높이 채우고 space-between으로 상하 분리 */}
        <div className="flex flex-1 flex-col items-center justify-between px-8 py-8">
          {/* 상단: 로고 + 설명 */}
          <div className="flex flex-col items-center gap-9">
            <AppLogo variant="bold" />
            <div className="flex flex-col items-center gap-1">
              <p
                className={`text-center text-base font-medium leading-[1.48] ${copy.subtitleSub ? 'text-neutral-800' : 'text-neutral-400'}`}
              >
                {copy.subtitle}
              </p>
              {copy.subtitleSub && (
                <p className="text-center text-sm text-base font-medium leading-[1.48] text-neutral-400">
                  {copy.subtitleSub}
                </p>
              )}
            </div>
          </div>

          {/* 하단: 버튼 + 약관 */}
          <div className="flex w-full flex-col items-center gap-10 pb-23">
            <div className="flex w-full flex-col gap-3">
              {/* 카카오 버튼 */}
              <Button
                className="h-auto w-full rounded-lg py-3 text-sm font-medium"
                disabled={isPromoting}
                onClick={() => onLogin(AUTH_PROVIDERS.kakao.label)}
                size="page"
                variant="kakao"
              >
                <span className="flex items-center justify-center gap-2">
                  <KakaoLogo className="size-[18px]" />
                  {isPromoting ? AUTH_UI_TEXT.processing : AUTH_PROVIDERS.kakao.continueLabel}
                </span>
              </Button>

              {/* 구글 버튼 */}
              <Button
                className="h-auto w-full rounded-lg py-3 text-sm font-medium"
                disabled={isPromoting}
                onClick={() => onLogin(AUTH_PROVIDERS.google.label)}
                size="page"
                variant="google"
              >
                <span className="flex items-center justify-center gap-2">
                  <GoogleLogo className="size-5" />
                  {isPromoting ? AUTH_UI_TEXT.processing : AUTH_PROVIDERS.google.continueLabel}
                </span>
              </Button>
            </div>

            {/* 약관 안내 */}
            <p className="text-center text-[0.75rem] leading-[1.36] text-neutral-400">
              {AUTH_UI_TEXT.termsPrefix}{' '}
              <a className="underline" href="#">
                {AUTH_UI_TEXT.termsOfService}
              </a>{' '}
              {AUTH_UI_TEXT.termsSeparator}{' '}
              <a className="underline" href="#">
                {AUTH_UI_TEXT.privacyPolicy}
              </a>
              {AUTH_UI_TEXT.termsSuffixPt1}
              <br />
              {AUTH_UI_TEXT.termsSuffixPt2}
            </p>
          </div>
        </div>
      </DrawerContentBottom>
    </DrawerRoot>
  )
}

export default LoginDialog
