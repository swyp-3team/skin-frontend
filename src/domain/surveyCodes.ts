import type { Concern, SkinType } from '../types/domain'

export const SKIN_TYPE_STEP = 15 as const
export const CONCERN_STEP = 14 as const

export const SKIN_TYPE_CODES: readonly SkinType[] = ['DRY', 'OILY', 'COMBINATION', 'SENSITIVE', 'UNKNOWN']
export const CONCERN_CODES: readonly Concern[] = ['DRY', 'ACNE', 'PIGMENTATION', 'AGING', 'SENSITIVE', 'SEBUM', 'PORE']

const SKIN_TYPE_CODE_SET = new Set<string>(SKIN_TYPE_CODES)
const CONCERN_CODE_SET = new Set<string>(CONCERN_CODES)

export function isSkinTypeCode(value: unknown): value is SkinType {
  return typeof value === 'string' && SKIN_TYPE_CODE_SET.has(value)
}

export function isConcernCode(value: unknown): value is Concern {
  return typeof value === 'string' && CONCERN_CODE_SET.has(value)
}
