import { MOCK_SURVEY_QUESTIONS } from '../constants/survey'
import type { AuthState } from '../types/auth'
import type { IngredientGroup, ProductCategory, SkinType } from '../types/domain'
import type { ApiClient } from './client'
import type {
  FullResult,
  PreviewResult,
  ProductDetail,
  RecommendedProduct,
  SurveyAnswer,
  SurveySubmitPayload,
  TopIngredientGroup,
} from './types'

// Q14 선택지 value -> SkinType 매핑 (mock 결과 생성용)
const SKIN_TYPE_FROM_ANSWER: Record<number, SkinType> = {
  1: 'DRY',
  2: 'OILY',
  3: 'COMBINATION',
  4: 'SENSITIVE',
}

// Q15 선택지 value -> IngredientGroup 매핑 (mock 결과 생성용)
const CONCERN_GROUP_FROM_ANSWER: Record<number, IngredientGroup> = {
  1: 'HYDRATION',
  2: 'SEBUM_CONTROL',
  3: 'ACNE',
  4: 'SOOTHING',
  5: 'BRIGHTENING',
  6: 'ANTI_AGING',
}

const groupIngredientMap: Record<IngredientGroup, string[]> = {
  HYDRATION: ['히알루론산', '글리세린'],
  BARRIER: ['세라마이드', '판테놀'],
  ACNE: ['살리실산', '티트리'],
  SEBUM_CONTROL: ['나이아신아마이드', '징크PCA'],
  SOOTHING: ['센텔라', '알란토인'],
  BRIGHTENING: ['비타민C', '나이아신아마이드'],
  TURNOVER: ['레티놀', 'PHA'],
  ANTI_AGING: ['펩타이드', '아데노신'],
}

const groupReasonMap: Record<IngredientGroup, string> = {
  HYDRATION: '수분 보충과 건조 완화를 우선으로 케어해요.',
  BARRIER: '피부 장벽을 강화하고 외부 자극 대응력을 높여요.',
  ACNE: '트러블 유발 요인을 줄이고 진정 케어를 함께 진행해요.',
  SEBUM_CONTROL: '과도한 피지 분비를 조절하는 성분이 필요해요.',
  SOOTHING: '민감해진 피부를 빠르게 진정시키는 케어가 중요해요.',
  BRIGHTENING: '칙칙함과 색소 고민 완화를 위한 관리가 필요해요.',
  TURNOVER: '묵은 각질 순환을 도와 피부결 개선이 필요해요.',
  ANTI_AGING: '탄력 저하 징후를 완화하는 안티에이징 관리가 필요해요.',
}

const skinTypeSummaryMap: Record<SkinType, string> = {
  DRY: '건조형 피부로 보여 보습과 장벽 중심 루틴을 권장해요.',
  OILY: '지성형 피부로 보여 피지 조절과 진정 중심 루틴을 권장해요.',
  COMBINATION: '복합성 피부로 보여 유수분 균형 중심 루틴을 권장해요.',
  SENSITIVE: '민감형 피부로 보여 저자극 진정 중심 루틴을 권장해요.',
}

const skinTypeFallbackGroups: Record<SkinType, [IngredientGroup, IngredientGroup]> = {
  DRY: ['HYDRATION', 'BARRIER'],
  OILY: ['SEBUM_CONTROL', 'ACNE'],
  COMBINATION: ['HYDRATION', 'SEBUM_CONTROL'],
  SENSITIVE: ['SOOTHING', 'BARRIER'],
}

const MOCK_PRODUCT_DETAILS: ProductDetail[] = [
  {
    productId: 101,
    category: 'TONER',
    brandName: '레이어드',
    name: '밸런스 하이드레이팅 토너',
    imageUrl: "https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0019/A00000019067724ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5",
    reason: '첫 단계 수분 밸런스를 맞추는 토너입니다.',
    price: 29900,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description:
      '레이어드 어드민 페이지의 상품 설명 내용이 들어갑니다. 레이어드 어드민 페이지의 상품 설명 내용이 들어갑니다. 레이어드 어드민 페이지의 상품 설명 내용이 들어갑니다.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
  {
    productId: 102,
    category: 'SERUM',
    brandName: '레이어드',
    name: '카밍 리페어 세럼',
    imageUrl: "https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0022/A000000223414107ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5",
    reason: '예민해진 피부를 진정시키는 집중 세럼입니다.',
    price: 34900,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description:
      '레이어드 어드민 페이지의 상품 설명 내용이 들어갑니다. 레이어드 어드민 페이지의 상품 설명 내용이 들어갑니다. 레이어드 어드민 페이지의 상품 설명 내용이 들어갑니다.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
]

const MOCK_PRODUCT_DETAIL_MAP = new Map<number, ProductDetail>(
  MOCK_PRODUCT_DETAILS.map((item) => [item.productId, item]),
)

function toRecommendedProduct(product: ProductDetail): RecommendedProduct {
  return {
    productId: product.productId,
    category: product.category,
    name: product.name,
    imageUrl: product.imageUrl,
    reason: product.reason,
  }
}

function getAnswerValue(answers: SurveyAnswer[], questionId: number): number | undefined {
  return answers.find((a) => a.questionId === questionId)?.value
}

function buildTop3(skinType: SkinType, primaryGroup: IngredientGroup): TopIngredientGroup[] {
  const [fallback1, fallback2] = skinTypeFallbackGroups[skinType]
  const groups = [...new Set([primaryGroup, fallback1, fallback2])].slice(0, 3)

  return groups.map((group, index) => ({
    group,
    score: Number((0.95 - index * 0.1).toFixed(2)),
    priority: index + 1,
    ingredients: groupIngredientMap[group],
    reason: groupReasonMap[group],
  }))
}

function createPreviewResult(answers: SurveyAnswer[]): PreviewResult {
  const skinType = SKIN_TYPE_FROM_ANSWER[getAnswerValue(answers, 14) ?? 1] ?? 'COMBINATION'
  const primaryGroup = CONCERN_GROUP_FROM_ANSWER[getAnswerValue(answers, 15) ?? 1] ?? 'HYDRATION'

  return {
    skinType,
    summary: skinTypeSummaryMap[skinType],
    top3: buildTop3(skinType, primaryGroup),
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

function createFullResult(answers: SurveyAnswer[]): FullResult {
  const preview = createPreviewResult(answers)

  return {
    ...preview,
    resultId: Date.now(),
    recommendedProducts: MOCK_PRODUCT_DETAILS.map(toRecommendedProduct),
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
  async getSurveyQuestions() {
    return withDelay([...MOCK_SURVEY_QUESTIONS])
  },

  async submitSurveyPreview(payload: SurveySubmitPayload) {
    return withDelay(createPreviewResult(payload.answers))
  },

  async submitSurveyResult(payload: SurveySubmitPayload, authState: AuthState) {
    if (!authState.accessToken) {
      throw new Error('로그인한 사용자만 전체 결과를 조회할 수 있습니다.')
    }

    const result = createFullResult(payload.answers)
    mockResultsDb.set(result.resultId, result)
    return withDelay(result)
  },

  async getResult(resultId: number, authState: AuthState) {
    if (!authState.accessToken) {
      throw new Error('로그인한 사용자만 결과를 조회할 수 있습니다.')
    }

    const result = mockResultsDb.get(resultId)
    if (!result) {
      throw new Error(`결과를 찾을 수 없습니다. (ID: ${resultId})`)
    }

    return withDelay(result)
  },

  async getProductDetail(productId: number) {
    const product = MOCK_PRODUCT_DETAIL_MAP.get(productId)
    if (!product) {
      throw new Error(`상품을 찾을 수 없습니다. (ID: ${productId})`)
    }

    return withDelay(product)
  },
}

