import GoogleLogo from '@/components/icons/GoogleLogo'
import KakaoLogo from '@/components/icons/KakaoLogo'

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
          <DialogTitle className="text-[1rem] font-semibold tracking-tight text-slate-950">로그인</DialogTitle>
          <DialogDescription className="text-[0.76rem] leading-6 text-slate-600">
            추천 제품까지 포함된 전체 결과를 확인하려면 간편 로그인으로 이어서 진행하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6 py-7">

          <Button className="h-11 font-normal"disabled={isPromoting} onClick={onLoginGoogle} variant="outline">
            <span className="grid w-full grid-cols-[1.25rem_1fr_1.25rem] items-center gap-3">
              <GoogleLogo className="size-4" />
              <span className="truncate text-center">{isPromoting ? '로그인 처리 중...' : 'Google로 계속하기'}</span>
              <span aria-hidden="true" className="size-5" />
            </span>
          </Button>

          <Button className="h-11 font-normal" disabled={isPromoting} onClick={onLoginKakao} variant="outline">
            <span className="grid w-full grid-cols-[1.25rem_1fr_1.25rem] items-center gap-3">
              <KakaoLogo className="size-5" />
              <span className="truncate text-center">{isPromoting ? '로그인 처리 중...' : 'Kakao로 계속하기'}</span>
              <span aria-hidden="true" className="size-5" />
            </span>
          </Button>

          <p className="text-center text-[11px] leading-5 text-slate-500">
            계정을 선택하면 현재 설문 결과 화면에서 바로 이어집니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
