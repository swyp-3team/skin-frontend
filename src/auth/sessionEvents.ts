export const SESSION_EXPIRED_EVENT = 'auth:session-expired' as const

export interface SessionExpiredDetail {
  reason: 'refresh_failed'
}

export function notifySessionExpired(detail: SessionExpiredDetail): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent<SessionExpiredDetail>(SESSION_EXPIRED_EVENT, {
      detail,
    }),
  )
}

type SessionExpiredListener = (event: CustomEvent<SessionExpiredDetail>) => void

export function addSessionExpiredListener(listener: SessionExpiredListener): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const eventListener: EventListener = (event) => {
    if (!(event instanceof CustomEvent)) {
      return
    }

    listener(event as CustomEvent<SessionExpiredDetail>)
  }

  window.addEventListener(SESSION_EXPIRED_EVENT, eventListener)

  return () => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, eventListener)
  }
}
