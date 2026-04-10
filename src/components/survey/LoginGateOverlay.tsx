import PillCtaButton from '../common/PillCtaButton'

interface LoginGateOverlayProps {
  onClick: () => void
}

function LoginGateOverlay({ onClick }: LoginGateOverlayProps) {
  return (
    <div className="absolute inset-x-0 bottom-[16px] rounded-[8px] bg-[rgba(255,255,255,0.55)] p-4 backdrop-blur-[2px]">
      <PillCtaButton className="w-full px-6 py-3 text-cta" onClick={onClick} type="button">
        로그인하고 전체 결과 보기
      </PillCtaButton>
    </div>
  )
}

export default LoginGateOverlay
