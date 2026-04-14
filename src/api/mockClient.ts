import { MOCK_SURVEY_QUESTIONS } from '../constants/survey'
import { CONCERN_OPTIONS, SKIN_TYPE_OPTIONS } from '../domain/surveyConfig'
import type { AuthState } from '../types/auth'
import type { Concern, IngredientGroup, ProductCategory, SkinType } from '../types/domain'
import type { ApiClient } from './client'
import type { FullResult, PreviewResult, SurveyQuestion, SurveyResultPayload, SurveySubmitPayload, TopIngredientGroup } from './types'

const mockSurveyQuestions: SurveyQuestion[] = MOCK_SURVEY_QUESTIONS.map((q) => ({ ...q, options: [...q.options] }))

const concernToGroup: Record<Concern, IngredientGroup> = {
  DRY: 'HYDRATION',
  SEBUM: 'SEBUM_CONTROL',
  ACNE: 'ACNE',
  SENSITIVE: 'SOOTHING',
  PIGMENTATION: 'BRIGHTENING',
  AGING: 'ANTI_AGING',
}

const groupIngredientMap: Record<IngredientGroup, string[]> = {
  HYDRATION: ['히알루론산', '글리세린'],
  BARRIER: ['세라마이드', '판테놀'],
  ACNE: ['살리실산', '아젤라익산'],
  SEBUM_CONTROL: ['나이아신아마이드', '징크 PCA'],
  SOOTHING: ['센텔라', '알란토인'],
  BRIGHTENING: ['비타민C', '트라넥사믹애씨드'],
  TURNOVER: ['레티놀', '락틱애씨드'],
  ANTI_AGING: ['레티날', '펩타이드'],
}

const groupReasonMap: Record<IngredientGroup, string> = {
  HYDRATION: '수분 보충과 건조 완화를 우선으로 케어하세요.',
  BARRIER: '피부 장벽을 보강해 자극에 대한 방어력을 높이세요.',
  ACNE: '트러블 유발 요인을 줄이고 진정을 병행하세요.',
  SEBUM_CONTROL: '과도한 피지 분비를 조절하는 성분이 필요합니다.',
  SOOTHING: '예민해진 피부를 진정시키는 접근이 중요합니다.',
  BRIGHTENING: '칙칙함과 색소 고민 완화를 위한 케어가 필요합니다.',
  TURNOVER: '묵은 각질 순환을 도와 피부결 개선이 필요합니다.',
  ANTI_AGING: '탄력 저하 신호를 완화하는 안티에이징 케어가 필요합니다.',
}

const skinTypeSummaryMap: Record<SkinType, string> = {
  DRY: '건조형 피부로 보이며 보습과 장벽 중심 루틴을 권장합니다.',
  OILY: '지성형 피부로 보이며 피지 조절과 진정 중심 루틴을 권장합니다.',
  COMBINATION: '복합성 피부로 보이며 유수분 균형을 맞추는 루틴을 권장합니다.',
  SENSITIVE: '민감형 피부로 보이며 저자극 진정 루틴을 권장합니다.',
}

const skinTypeFallbackGroups: Record<SkinType, IngredientGroup[]> = {
  DRY: ['HYDRATION', 'BARRIER', 'SOOTHING'],
  OILY: ['SEBUM_CONTROL', 'ACNE', 'SOOTHING'],
  COMBINATION: ['HYDRATION', 'SEBUM_CONTROL', 'SOOTHING'],
  SENSITIVE: ['SOOTHING', 'BARRIER', 'HYDRATION'],
}

function dedupeGroups(payload: SurveySubmitPayload): IngredientGroup[] {
  const groupsFromConcerns = payload.concerns.map((concern) => concernToGroup[concern])
  const fallbackGroups = skinTypeFallbackGroups[payload.skinType]
  const defaultGroups: IngredientGroup[] = ['HYDRATION', 'SOOTHING', 'BARRIER']

  const merged = [...groupsFromConcerns, ...fallbackGroups, ...defaultGroups]
  return [...new Set(merged)].slice(0, 3)
}

function buildTop3(payload: SurveySubmitPayload): TopIngredientGroup[] {
  const groups = dedupeGroups(payload)

  return groups.map((group, index) => ({
    group,
    score: Number((0.95 - index * 0.1).toFixed(2)),
    priority: index + 1,
    ingredients: groupIngredientMap[group],
    reason: groupReasonMap[group],
  }))
}

function createPreviewResult(payload: SurveySubmitPayload): PreviewResult {
  return {
    skinType: payload.skinType,
    summary: skinTypeSummaryMap[payload.skinType],
    top3: buildTop3(payload),
  }
}

function createRoutine(top3: TopIngredientGroup[]): FullResult['routine'] {
  const categories: ProductCategory[] = ['TONER', 'SERUM', 'CREAM']

  return categories.map((category, index) => {
    const source = top3[index % top3.length]
    return {
      category,
      guide: `${source.ingredients[0]} 중심으로 ${groupReasonMap[source.group]}`,
    }
  })
}

function createFullResult(payload: SurveySubmitPayload): FullResult {
  const preview = createPreviewResult(payload)

  return {
    ...preview,
    resultId: Date.now(),
    recommendedProducts: [
      {
        productId: 101,
        name: '밸런스 수분 토너',
        category: 'TONER',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80',
        reason: `${preview.top3[0].ingredients[0]} 기반의 첫 단계 보습 케어`,
      },
      {
        productId: 102,
        name: '카밍 리페어 세럼',
        category: 'SERUM',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
        reason: `${preview.top3[1].ingredients[0]} 중심의 집중 케어`,
      },
    ],
    routine: createRoutine(preview.top3),
  }
}

function withDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms)
  })
}

const mockResultsDb = new Map<number, FullResult>()

export const mockApiClient: ApiClient = {
  async getSurveyQuestions(step: number) {
    const question = mockSurveyQuestions[step - 1]
    return withDelay(question ? [question] : [])
  },

  async getSurveyStepConfig() {
    return withDelay({
      skinTypeStep: {
        title: '피부 타입을 선택해주세요',
        options: [...SKIN_TYPE_OPTIONS],
      },
      concernStep: {
        title: '고민을 선택해주세요',
        options: [...CONCERN_OPTIONS],
      },
    })
  },

  async submitSurveyPreview(payload) {
    return withDelay(createPreviewResult(payload))
  },

  async submitSurveyResult(payload: SurveyResultPayload, authState: AuthState) {
    if (!authState.accessToken) {
      throw new Error('로그인된 사용자만 전체 결과를 조회할 수 있습니다.')
    }

    if ('resultId' in payload) {
      throw new Error('Mock 클라이언트는 resultId 기반 조회를 지원하지 않습니다.')
    }

    const result = createFullResult(payload)
    mockResultsDb.set(result.resultId, result)
    return withDelay(result)
  },

  async getResult(resultId: number, authState: AuthState) {
    if (!authState.accessToken) {
      throw new Error('로그인된 사용자만 결과를 조회할 수 있습니다.')
    }

    const result = mockResultsDb.get(resultId)
    if (!result) {
      throw new Error(`결과를 찾을 수 없습니다. (ID: ${resultId})`)
    }

    return withDelay(result)
  },
}
