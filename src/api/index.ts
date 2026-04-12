import type { ApiClient } from './client'
import { env } from '../lib/env'
import { createLiveApiClient } from './liveClient'
import { mockApiClient } from './mockClient'

const baseUrl = env.VITE_API_BASE_URL ?? '/api/v1'

function createApiClient(): ApiClient {
  if (env.VITE_API_MODE === 'live') {
    return createLiveApiClient(baseUrl)
  }

  return mockApiClient
}

export const apiClient = createApiClient()
