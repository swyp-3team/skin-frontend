import { z } from 'zod'

const envSchema = z.object({
  VITE_API_MODE: z.enum(['mock', 'live']).default('mock'),
  VITE_API_BASE_URL: z.string().default('https://api.layerd.co.kr/api/v1'),
  VITE_OAUTH_BASE_URL: z.string().optional(),
})

export const env = envSchema.parse({
  VITE_API_MODE: import.meta.env.VITE_API_MODE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_OAUTH_BASE_URL: import.meta.env.VITE_OAUTH_BASE_URL,
})
