import GoogleLogo from '@/components/icons/GoogleLogo'
import KakaoLogo from '@/components/icons/KakaoLogo'

import { AUTH_PROVIDERS, AUTH_UI_TEXT } from '../../constants/auth'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

interface LoginDialogProps {
  open: boolean
  isPromoting: boolean
  onOpenChange: (open: boolean) => void
  onLoginGoogle: () => void
  onLoginKakao: () => void
}

function LoginDialog({ open, isPromoting, onOpenChange, onLoginGoogle, onLoginKakao }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-[22rem] gap-0 overflow-hidden border border-login-border bg-login-surface p-0 sm:max-w-[24rem]">
        <DialogHeader className="gap-2 border-login-border bg-linear-to-b from-white to-card-bg px-6 py-4">
          <DialogTitle className="text-[1rem] font-semibold tracking-tight text-slate-950">
            {AUTH_UI_TEXT.loginTitle}
          </DialogTitle>
          <DialogDescription className="text-[0.76rem] leading-6 text-slate-600">
            {AUTH_UI_TEXT.loginDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6 py-7">
          <Button className="h-11 font-normal" disabled={isPromoting} onClick={onLoginGoogle} variant="outline">
            <span className="grid w-full grid-cols-[1.25rem_1fr_1.25rem] items-center gap-3">
              <GoogleLogo className="size-4" />
              <span className="truncate text-center">
                {isPromoting ? AUTH_UI_TEXT.processing : AUTH_PROVIDERS.google.continueLabel}
              </span>
              <span aria-hidden="true" className="size-5" />
            </span>
          </Button>

          <Button className="h-11 font-normal" disabled={isPromoting} onClick={onLoginKakao} variant="outline">
            <span className="grid w-full grid-cols-[1.25rem_1fr_1.25rem] items-center gap-3">
              <KakaoLogo className="size-5" />
              <span className="truncate text-center">
                {isPromoting ? AUTH_UI_TEXT.processing : AUTH_PROVIDERS.kakao.continueLabel}
              </span>
              <span aria-hidden="true" className="size-5" />
            </span>
          </Button>

          <p className="text-center text-[11px] leading-5 text-slate-500">
            {AUTH_UI_TEXT.resumeHint}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
