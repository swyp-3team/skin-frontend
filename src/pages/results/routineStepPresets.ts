export type RoutineTabId = 'am' | 'pm'

export interface RoutineStepPreset {
  ingredients: readonly [string, string]
  description: string
}

export type RoutineStepPresetMap = Record<RoutineTabId, readonly RoutineStepPreset[]>

const AM_STEP_PRESETS: readonly RoutineStepPreset[] = [
  {
    ingredients: ['히알루론산', '글리세린'],
    description: '세안 직후 빠르게 수분을 첫 레이어로 채워줘요. 히알루론산이 피부 속 수분을 붙잡아 둡니다.',
  },
  {
    ingredients: ['나이아신아마이드', '베타글루칸'],
    description: '장벽을 보조하면서 수분이 새어나가지 않도록 도와줘요. 이 단계가 루틴의 핵심이에요.',
  },
  {
    ingredients: ['세라마이드', '콜레스테롤'],
    description: '쌓은 수분이 날아가지 않도록 잠가줘요. 하루 종일 촉촉함이 유지되도록 돕습니다.',
  },
  {
    ingredients: ['징크옥사이드', '티타늄디옥사이드'],
    description: '자외선은 피부 장벽을 직접 손상시켜요. 아침 루틴의 마지막 단계에서 꼭 발라주세요.',
  },
]

const PM_STEP_PRESETS: readonly RoutineStepPreset[] = [
  {
    ingredients: ['판테놀', '알란토인'],
    description: '저녁 세안 후에는 자극 완화에 집중해요. 피부가 편안해지도록 첫 단계를 가볍게 시작하세요.',
  },
  {
    ingredients: ['마데카소사이드', '베타글루칸'],
    description: '민감해진 부위를 중심으로 진정 성분을 채워주세요. 붉은기 완화에 도움이 됩니다.',
  },
  {
    ingredients: ['세라마이드', '스쿠알란'],
    description: '수면 중 수분 손실을 줄일 수 있도록 보호막을 만들어 주세요. 건조감 완화에 효과적입니다.',
  },
  {
    ingredients: ['아젤라익산', 'PHA'],
    description: '집중 케어가 필요할 때는 국소 부위에 얇게 덧발라 주세요. 과도한 사용은 피하는 것이 좋아요.',
  },
]

export const ROUTINE_STEP_PRESET_MAP: RoutineStepPresetMap = {
  am: AM_STEP_PRESETS,
  pm: PM_STEP_PRESETS,
}

export function getRoutineStepPreset(tabId: RoutineTabId, stepIndex: number): RoutineStepPreset {
  const presets = ROUTINE_STEP_PRESET_MAP[tabId]
  const fallbackIndex = Math.max(0, presets.length - 1)
  return presets[Math.min(stepIndex, fallbackIndex)] ?? presets[0]
}
