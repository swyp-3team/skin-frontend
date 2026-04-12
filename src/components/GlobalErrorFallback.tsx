import type { FallbackProps } from 'react-error-boundary'

function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#d9d9d9] px-6 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">오류가 발생했습니다</p>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <div className="flex gap-3">
        <button
          className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm text-slate-700"
          onClick={() => window.location.assign('/')}
          type="button"
        >
          홈으로
        </button>
        <button
          className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white"
          onClick={resetErrorBoundary}
          type="button"
        >
          새로고침
        </button>
      </div>
    </div>
  )
}

export default GlobalErrorFallback
