import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";

interface LoginDialogProps {
  open: boolean;
  isPromoting: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginGoogle: () => void;
  onLoginKakao: () => void;
}

function LoginDialog({
  open,
  isPromoting,
  onOpenChange,
  onLoginGoogle,
  onLoginKakao,
}: LoginDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:items-start sm:pt-[25vh]">
        <div
          aria-busy={isPromoting}
          className="flex min-h-[200px] w-full max-w-[360px] flex-col rounded-[10px] border border-slate-200 bg-white px-5 pb-5 pt-4 shadow-sm"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg text-zinc-800">로그인</DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-zinc-600">
                간편한 소셜로그인으로 빠르게 시작하세요.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <button
                aria-label="로그인 모달 닫기"
                className="text-2xl leading-none text-slate-500"
                type="button"
              >
                ×
              </button>
            </DialogClose>
          </div>

          <div className="mt-auto space-y-3">
            <button
              autoFocus
              className="w-full rounded-[10px] bg-[#f3f3f3] px-4 py-2 text-base font-semibold text-slate-900"
              disabled={isPromoting}
              onClick={onLoginGoogle}
              type="button"
            >
              Google 계정으로 로그인
            </button>
            <button
              className="w-full rounded-[10px] bg-[#f3f3f3] px-4 py-2 text-base font-semibold text-slate-900"
              disabled={isPromoting}
              onClick={onLoginKakao}
              type="button"
            >
              카카오 계정으로 로그인
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
