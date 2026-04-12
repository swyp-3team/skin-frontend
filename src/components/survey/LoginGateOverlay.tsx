import { AUTH_UI_TEXT } from '../../constants/auth'
import { Button } from '../ui/button'

interface LoginGateOverlayProps {
  onClick: () => void
}

function LoginGateOverlay({ onClick }: LoginGateOverlayProps) {
  return (
    <>
      {/* 블러 오버레이 — overflow-hidden은 여기서만 사용 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[16px] h-3/5"
      >
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.55)] backdrop-blur-[2px] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_18%,black)] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black)]" />
      </div>

      {/* 버튼 — 오버레이 밖에서 sticky 사용 */}
      <div className="sticky bottom-4 z-50 px-4">
        <Button
          className="h-auto w-full rounded-xl px-6 py-3 text-lg font-medium"
          onClick={onClick}
          type="button"
          variant="cta"
        >
          {AUTH_UI_TEXT.gatedResultCta}
        </Button>
      </div>
    </>
  )
}

export default LoginGateOverlay
