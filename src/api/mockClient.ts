import { MOCK_SURVEY_QUESTIONS } from '../constants/survey'
import { CONCERN_STEP, SKIN_TYPE_STEP } from '../domain/surveyCodes'
import type { AuthState } from '../types/auth'
import type { Concern, IngredientGroup, ProductCategory, SkinType } from '../types/domain'
import type { ApiClient } from './client'
import { ApiError } from './errors'
import type {
  FullResult,
  PreviewApiData,
  PreviewResult,
  ProductDetail,
  RecommendedProduct,
  ResultDetail,
  ResultProductsPageData,
  ResultProductsQuery,
  ResultSummary,
  RoutineGroup,
  SurveyQuestion,
  SurveyResultInput,
  SurveySubmitPayload,
  TopIngredientGroup,
} from './types'

type RandomFn = () => number

const SKIN_TYPE_CODE_BY_OPTION_NUMBER: Record<number, SkinType> = {
  1: 'DRY',
  2: 'OILY',
  3: 'COMBINATION',
  4: 'SENSITIVE',
  5: 'UNKNOWN',
}

const CONCERN_CODE_BY_OPTION_NUMBER: Record<number, Concern> = {
  1: 'DRY',
  2: 'ACNE',
  3: 'PIGMENTATION',
  4: 'AGING',
  5: 'SENSITIVE',
  6: 'SEBUM',
  7: 'PORE',
}

const INGREDIENT_GROUPS: readonly IngredientGroup[] = [
  'HYDRATION',
  'BARRIER',
  'ACNE',
  'SEBUM_CONTROL',
  'SOOTHING',
  'BRIGHTENING',
  'TURNOVER',
  'ANTI_AGING',
]

const groupIngredientMap: Record<IngredientGroup, string[]> = {
  HYDRATION: ['Hyaluronic Acid', 'Glycerin'],
  BARRIER: ['Ceramide', 'Panthenol'],
  ACNE: ['Salicylic Acid', 'Tea Tree'],
  SEBUM_CONTROL: ['Niacinamide', 'Zinc PCA'],
  SOOTHING: ['Centella', 'Allantoin'],
  BRIGHTENING: ['Vitamin C', 'Niacinamide'],
  TURNOVER: ['Retinol', 'PHA'],
  ANTI_AGING: ['Peptide', 'Adenosine'],
}

const groupReasonMap: Record<IngredientGroup, string> = {
  HYDRATION: 'Hydration-focused care helps relieve skin dryness.',
  BARRIER: 'Barrier care helps improve skin resilience.',
  ACNE: 'Acne care helps reduce irritation triggers.',
  SEBUM_CONTROL: 'Sebum care helps reduce excess oil.',
  SOOTHING: 'Soothing care helps calm sensitive skin.',
  BRIGHTENING: 'Brightening care helps with uneven tone.',
  TURNOVER: 'Turnover care helps improve texture.',
  ANTI_AGING: 'Anti-aging care helps with elasticity concerns.',
}

const skinTypeSummaryMap: Record<SkinType, string> = {
  DRY: 'Dry skin profile. Hydration and barrier-focused routine is recommended.',
  OILY: 'Oily skin profile. Sebum control and soothing routine is recommended.',
  COMBINATION: 'Combination skin profile. Balanced hydration and sebum care is recommended.',
  SENSITIVE: 'Sensitive skin profile. Gentle soothing and barrier care is recommended.',
  UNKNOWN: 'Unknown skin profile. Balanced hydration and barrier-focused routine is recommended.',
}

const skinTypeFallbackGroups: Record<SkinType, [IngredientGroup, IngredientGroup]> = {
  DRY: ['HYDRATION', 'BARRIER'],
  OILY: ['SEBUM_CONTROL', 'ACNE'],
  COMBINATION: ['HYDRATION', 'SEBUM_CONTROL'],
  SENSITIVE: ['SOOTHING', 'BARRIER'],
  UNKNOWN: ['BARRIER', 'HYDRATION'],
}

const MOCK_PRODUCT_DETAILS: ProductDetail[] = [
  {
    productId: 101,
    category: 'TONER',
    brandName: 'Guide',
    name: 'Balance Hydrating Toner',
    imageUrl:
      'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0019/A00000019067724ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5',
    reason: 'Suitable for the first hydration step.',
    price: 29900,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description: 'Mock product description.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
  {
    productId: 102,
    category: 'SERUM',
    brandName: 'Guide',
    name: 'Calming Repair Serum',
    imageUrl:
      'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0022/A000000223414107ko.jpg?l=ko&QT=85&SF=webp&sharpen=1x0.5',
    reason: 'Suitable for targeted treatment.',
    price: 34900,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description: 'Mock product description.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
  {
    productId: 103,
    category: 'CREAM',
    brandName: 'Guide',
    name: 'Ceramide Moisture Cream',
    imageUrl: null,
    reason: 'Suitable for moisture barrier finish.',
    price: 32000,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description: 'Mock product description.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
  {
    productId: 104,
    category: 'SUNSCREEN',
    brandName: 'Guide',
    name: 'Daily Mild Sunscreen',
    imageUrl: null,
    reason: 'Suitable for UV protection.',
    price: 18900,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description: 'Mock product description.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
  {
    productId: 105,
    category: 'CLEANSER',
    brandName: 'Guide',
    name: 'Mild Low PH Cleanser',
    imageUrl: null,
    reason: 'Suitable for gentle cleansing.',
    price: 14500,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description: 'Mock product description.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
  {
    productId: 106,
    category: 'TONER',
    brandName: 'Guide',
    name: 'Hydra Balance Toner',
    imageUrl: null,
    reason: 'Suitable for hydration refresh.',
    price: 17500,
    priceAsOf: '2026-04-17',
    featureTags: ['TOP1', 'TOP2', 'TOP3'],
    description: 'Mock product description.',
    purchaseUrl: 'https://www.oliveyoung.co.kr',
  },
]

const MOCK_PRODUCT_DETAIL_MAP = new Map<number, ProductDetail>(MOCK_PRODUCT_DETAILS.map((item) => [item.productId, item]))

const MOCK_ROUTINE_GROUP_BASE: Omit<RoutineGroup, 'skinResultId' | 'createdAt'> = {
  routineGroupId: 21,
  title: '민감 피부 데일리 루틴',
  skinType: 'SENSITIVE',
  summary: '민감도가 높아 진정과 장벽 회복 중심으로 구성한 루틴입니다.',
  caution: '아침 루틴 마지막 단계에서 자외선 차단제를 꼭 사용하세요.',
  amRoutine: {
    routineId: 31,
    routineType: 'AM',
    memo: '아침에는 자극이 적은 보습 중심으로 사용합니다.',
    products: [
      {
        productId: 101,
        name: '시카 진정 토너',
        brand: 'SKINLAB',
        category: 'TONER',
        imageUrl: MOCK_PRODUCT_DETAILS[0]?.imageUrl ?? null,
        sortOrder: 1,
        reason: '민감한 피부를 진정시키는 성분이 포함되어 첫 단계에 적합합니다.',
        note: '손바닥에 덜어 가볍게 눌러 흡수시켜 주세요.',
      },
      {
        productId: 102,
        name: '카밍 리페어 세럼',
        brand: 'SKINLAB',
        category: 'SERUM',
        imageUrl: MOCK_PRODUCT_DETAILS[1]?.imageUrl ?? null,
        sortOrder: 2,
        reason: '장벽 케어 성분이 포함되어 피부 컨디션을 안정적으로 유지합니다.',
        note: '볼과 턱 라인 위주로 얇게 펴 발라 주세요.',
      },
      {
        productId: 103,
        name: '세라마이드 모이스처 크림',
        brand: 'SKINLAB',
        category: 'CREAM',
        imageUrl: null,
        sortOrder: 3,
        reason: '보습막 형성에 유리해 수분 손실을 줄이는 데 도움이 됩니다.',
        note: '취침 전 건조 부위에 한 번 더 덧발라 주세요.',
      },
    ],
  },
  pmRoutine: {
    routineId: 41,
    routineType: 'PM',
    memo: '저녁에는 충분한 보습과 진정 중심으로 마무리합니다.',
    products: [
      {
        productId: 101,
        name: '시카 진정 토너',
        brand: 'SKINLAB',
        category: 'TONER',
        imageUrl: MOCK_PRODUCT_DETAILS[0]?.imageUrl ?? null,
        sortOrder: 1,
        reason: '피부 온도를 낮춰 저녁 자극 진정에 도움이 됩니다.',
        note: '화장솜 대신 손으로 두드려 흡수해 주세요.',
      },
      {
        productId: 102,
        name: '카밍 리페어 세럼',
        brand: 'SKINLAB',
        category: 'SERUM',
        imageUrl: MOCK_PRODUCT_DETAILS[1]?.imageUrl ?? null,
        sortOrder: 2,
        reason: '민감 반응 완화에 도움을 주는 성분이 포함되어 있습니다.',
        note: '민감 부위에는 얇게 레이어링해 주세요.',
      },
      {
        productId: 103,
        name: '세라마이드 모이스처 크림',
        brand: 'SKINLAB',
        category: 'CREAM',
        imageUrl: null,
        sortOrder: 3,
        reason: '보습 장벽을 강화해 밤사이 건조를 줄입니다.',
        note: '건조한 날에는 소량을 추가 사용해 주세요.',
      },
    ],
  },
}

const MOCK_RESULT_PRODUCTS: ResultProductsPageData['products'] = [
  {
    productId: 101,
    name: '시카 진정 토너',
    brand: 'SKINLAB',
    category: 'TONER',
    price: 21000,
    imageUrl: MOCK_PRODUCT_DETAILS[0]?.imageUrl ?? null,
  },
  {
    productId: 102,
    name: '카밍 리페어 세럼',
    brand: 'SKINLAB',
    category: 'SERUM',
    price: 29800,
    imageUrl: MOCK_PRODUCT_DETAILS[1]?.imageUrl ?? null,
  },
  {
    productId: 103,
    name: '세라마이드 모이스처 크림',
    brand: 'SKINLAB',
    category: 'CREAM',
    price: 32000,
    imageUrl: null,
  },
  {
    productId: 104,
    name: '데일리 마일드 선크림',
    brand: 'SKINLAB',
    category: 'SUNSCREEN',
    price: 18900,
    imageUrl: null,
  },
  {
    productId: 105,
    name: '포밍 약산성 클렌저',
    brand: 'SKINLAB',
    category: 'CLEANSER',
    price: 14500,
    imageUrl: null,
  },
  {
    productId: 106,
    name: '수분 밸런스 토너',
    brand: 'SKINLAB',
    category: 'TONER',
    price: 17500,
    imageUrl: null,
  },
]

function toRecommendedProduct(product: ProductDetail): RecommendedProduct {
  return {
    productId: product.productId,
    category: product.category,
    name: product.name,
    imageUrl: product.imageUrl,
    reason: product.reason,
  }
}

function resolveMockOptionCode(step: number, optionNumber: number): SkinType | Concern | null {
  if (step === SKIN_TYPE_STEP) {
    return SKIN_TYPE_CODE_BY_OPTION_NUMBER[optionNumber] ?? null
  }

  if (step === CONCERN_STEP) {
    return CONCERN_CODE_BY_OPTION_NUMBER[optionNumber] ?? null
  }

  return null
}

function attachOptionCodes(questions: readonly (typeof MOCK_SURVEY_QUESTIONS)[number][]): SurveyQuestion[] {
  return questions.map((question) => ({
    step: question.step,
    question: question.question,
    options: question.options.map((option) => ({
      optionNumber: option.optionNumber,
      content: option.content,
      code: resolveMockOptionCode(question.step, option.optionNumber),
    })),
  }))
}

function createConcernToIngredientGroupResolver(rng: RandomFn = Math.random) {
  const selectedMap = new Map<Concern, IngredientGroup>()

  return (concern: Concern): IngredientGroup => {
    const cached = selectedMap.get(concern)
    if (cached) {
      return cached
    }

    const index = Math.floor(rng() * INGREDIENT_GROUPS.length)
    const selected = INGREDIENT_GROUPS[index] ?? INGREDIENT_GROUPS[0]
    selectedMap.set(concern, selected)
    return selected
  }
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

function pickPrimaryIngredientGroup(payload: SurveySubmitPayload, resolveGroup: (concern: Concern) => IngredientGroup) {
  const concern = payload.concerns[0]
  if (!concern) {
    return skinTypeFallbackGroups[payload.skinType][0]
  }

  return resolveGroup(concern)
}

function createPreviewResult(payload: SurveySubmitPayload): PreviewResult {
  const resolveConcernGroup = createConcernToIngredientGroupResolver()
  const primaryGroup = pickPrimaryIngredientGroup(payload, resolveConcernGroup)

  return {
    skinType: payload.skinType,
    summary: skinTypeSummaryMap[payload.skinType],
    top3: buildTop3(payload.skinType, primaryGroup),
  }
}

function createRoutine(top3: TopIngredientGroup[]): FullResult['routine'] {
  const categories: ProductCategory[] = ['TONER', 'SERUM', 'CREAM']

  return categories.map((category, index) => {
    const source = top3[index % top3.length]
    return {
      category,
      guide: `${source.ingredients[0]} step recommended. ${groupReasonMap[source.group]}`,
    }
  })
}

function createFullResult(payload: SurveySubmitPayload): ResultDetail {
  const preview = createPreviewResult(payload)
  const resultId = Date.now()

  return {
    ...preview,
    resultId,
    recommendedProducts: MOCK_PRODUCT_DETAILS.map(toRecommendedProduct),
    routine: createRoutine(preview.top3),
    resultSummary: createMockResultSummary(resultId),
  }
}

function withDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms)
  })
}

function createMockResultSummary(resultId: number): ResultSummary {
  return {
    resultId: String(resultId),
    title: '민감 피부 데일리 루틴',
    badge: { label: '진정 케어가 필요한 상태예요', type: 'warning' },
    summaryShort: '민감도가 높아 진정과 장벽 회복 중심의 케어가 필요합니다.',
    createdAt: '2026-04-05T14:30:00+09:00',
  }
}

function createMockRoutineGroup(skinResultId: number): RoutineGroup {
  return {
    ...MOCK_ROUTINE_GROUP_BASE,
    skinResultId,
    createdAt: '2026-04-05T14:30:00',
  }
}

const MOCK_RESULT_PRODUCTS_PAGE_SIZE = 4

function createMockResultProductsPage(query: ResultProductsQuery): ResultProductsPageData {
  const page = Math.max(1, query.page)
  const startIndex = (page - 1) * MOCK_RESULT_PRODUCTS_PAGE_SIZE
  const endIndex = startIndex + MOCK_RESULT_PRODUCTS_PAGE_SIZE
  const pageItems = MOCK_RESULT_PRODUCTS.slice(startIndex, endIndex)

  return {
    tags: ['민감성'],
    skinResultDate: '2026-04-16',
    products: pageItems,
    hasNext: endIndex < MOCK_RESULT_PRODUCTS.length,
  }
}

const mockResultsDb = new Map<number, FullResult>()
const mockPreviewDb = new Map<string, PreviewResult>()

export const mockApiClient: ApiClient = {
  async getSurveyQuestions() {
    return withDelay(attachOptionCodes(MOCK_SURVEY_QUESTIONS))
  },

  async submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewApiData> {
    const preview = createPreviewResult(payload)
    const previewToken = crypto.randomUUID()
    mockPreviewDb.set(previewToken, preview)
    return withDelay({ preview, previewToken })
  },

  async submitSurveyResult(input: SurveyResultInput, authState: AuthState) {
    if (!authState.accessToken) {
      throw new ApiError('Only authenticated users can fetch full results.', 401, 'UNAUTHORIZED')
    }

    if ('previewToken' in input) {
      const preview = mockPreviewDb.get(input.previewToken)
      if (!preview) {
        throw new ApiError('Preview result not found.', 404, 'PREVIEW_NOT_FOUND')
      }

      const resultId = Date.now()
      const result: ResultDetail = {
        ...preview,
        resultId,
        recommendedProducts: MOCK_PRODUCT_DETAILS.map(toRecommendedProduct),
        routine: createRoutine(preview.top3),
        resultSummary: createMockResultSummary(resultId),
      }
      mockResultsDb.set(result.resultId, result)
      return withDelay(result)
    }

    const result = createFullResult(input)
    mockResultsDb.set(result.resultId, result)
    return withDelay(result)
  },

  async getResult(resultId: number, authState: AuthState): Promise<ResultDetail> {
    if (!authState.accessToken) {
      throw new ApiError('Only authenticated users can fetch full results.', 401, 'UNAUTHORIZED')
    }

    const result = mockResultsDb.get(resultId) as ResultDetail | undefined
    if (!result) {
      throw new ApiError(`Result not found. (ID: ${resultId})`, 404, 'RESULT_NOT_FOUND')
    }

    return withDelay(result)
  },

  async getRoutineGroup(skinResultId: number, authState: AuthState) {
    if (!authState.accessToken) {
      throw new ApiError('Only authenticated users can fetch routine groups.', 401, 'UNAUTHORIZED')
    }

    return withDelay(createMockRoutineGroup(skinResultId))
  },

  async getRecommendedProducts(query: ResultProductsQuery, authState: AuthState) {
    if (!authState.accessToken) {
      throw new ApiError('Only authenticated users can fetch recommended products.', 401, 'UNAUTHORIZED')
    }

    return withDelay(createMockResultProductsPage(query))
  },

  async getProductDetail(productId: number) {
    const product = MOCK_PRODUCT_DETAIL_MAP.get(productId)
    if (!product) {
      throw new ApiError(`Product not found. (ID: ${productId})`, 404, 'PRODUCT_NOT_FOUND')
    }

    return withDelay(product)
  },
}
