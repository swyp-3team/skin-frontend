import { STORAGE_KEYS } from '../constants/storage'

export type PostLoginIntent =
  | { type: 'promote-preview' }
  | { type: 'return'; returnTo: string }

export function saveIntent(intent: PostLoginIntent): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.postLoginIntent, JSON.stringify(intent))
  } catch {
    // sessionStorage 쓰기 실패 시 무시 (private 모드 등)
  }
}

export function readIntent(): PostLoginIntent | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.postLoginIntent)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return null
    const { type } = parsed as Record<string, unknown>
    if (type === 'promote-preview') return { type: 'promote-preview' }
    if (type === 'return' && typeof (parsed as Record<string, unknown>).returnTo === 'string') {
      return { type: 'return', returnTo: (parsed as Record<string, unknown>).returnTo as string }
    }
    return null
  } catch {
    return null
  }
}

export function clearIntent(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.postLoginIntent)
  } catch {
    // 무시
  }
}
