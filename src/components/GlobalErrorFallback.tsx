import type { FallbackProps } from 'react-error-boundary'

import { Button } from '@/components/ui/button'

function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-neutral-200 px-6 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-neutral-800">오류가 발생했습니다</p>
        <p className="text-sm text-neutral-500">{message}</p>
      </div>
      <div className="flex gap-3">
        <Button
          className="rounded-full"
          onClick={() => window.location.assign('/')}
          size="compact"
          type="button"
          variant="outline"
        >
          홈으로
        </Button>
        <Button
          className="rounded-full"
          onClick={resetErrorBoundary}
          size="compact"
          type="button"
          variant="dark"
        >
          새로고침
        </Button>
      </div>
    </div>
  )
}

export default GlobalErrorFallback
