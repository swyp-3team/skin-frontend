import type { ApiClient } from './client'
import { env } from '../lib/env'
import { createLiveApiClient } from './liveClient'
import { mockApiClient } from './mockClient'

const baseUrl = env.VITE_API_BASE_URL

function createApiClient(): ApiClient {
  if (env.VITE_API_MODE === 'mock') {
    return mockApiClient
  }

  return createLiveApiClient(baseUrl)
}

export const apiClient = createApiClient()
