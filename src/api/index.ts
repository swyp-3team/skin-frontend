import type { ApiClient } from './client'
import { createLiveApiClient } from './liveClient'
import { mockApiClient } from './mockClient'

type ApiMode = 'mock' | 'live'

const DEFAULT_API_MODE: ApiMode = 'mock'
const rawApiMode = import.meta.env.VITE_API_MODE
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

function resolveApiMode(mode: string | undefined): ApiMode {
  if (mode === 'live' || mode === 'mock') {
    return mode
  }

  if (import.meta.env.DEV) {
    console.warn(`[api] Unknown VITE_API_MODE="${mode ?? '(empty)'}". Falling back to "${DEFAULT_API_MODE}".`)
  }

  // Production also falls back to mock to avoid hard failures from typoed env values.
  return DEFAULT_API_MODE
}

const apiMode = resolveApiMode(rawApiMode)

function createApiClient(): ApiClient {
  if (apiMode === 'live') {
    return createLiveApiClient(baseUrl)
  }

  return mockApiClient
}

export const apiClient = createApiClient()
