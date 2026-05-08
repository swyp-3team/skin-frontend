import { buttonVariants } from '../ui/button'
import { cn } from '../../lib/utils'
import { selectIsAuthenticated, useAuthStore } from '../../stores/authStore'
import { env } from '../../lib/env'

interface MockLoginButtonProps {
  className?: string
}

/**
 * 개발용 임의 로그인 버튼.
 * mock 모드에서만 렌더링되며, 추후 제거 시 HomePage의 사용 지점만 삭제하면 됩니다.
 */
function MockLoginButton({ className }: MockLoginButtonProps) {
  const isMockMode = env.VITE_API_MODE === 'mock'
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)

  if (!isMockMode) {
    return null
  }

  function handleMockLogin() {
    setUser({
      userId: 1,
      nickname: 'Mock User',
      role: 'USER',
      profileImageUrl: null,
      name: 'Mock User',
      email: 'mock.user@layerd.local',
    })
  }

  return (
    <button
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-11 w-full rounded-full px-6 text-center text-sm font-medium',
        className,
      )}
      onClick={handleMockLogin}
      type="button"
    >
      {isAuthenticated ? '임의 로그인 완료' : '임의 로그인하기'}
    </button>
  )
}

export default MockLoginButton
