import { MOCK_SURVEY_QUESTIONS } from '../constants/survey'
import { CONCERN_STEP, SKIN_TYPE_STEP } from '../domain/surveyCodes'
import type { AuthUser } from '../types/auth'
import type { Concern, IngredientGroup, ProductCategory, SkinType } from '../types/domain'
import type { ApiClient } from './client'
import { ApiError } from './errors'
import type {
  PreviewApiData,
  PreviewResult,
  ProductDetail,
  ProfileData,
  ResultDetail,
  ResultIngredientMeta,
  ResultProductsFilterCategory,
  ResultProductsPageData,
  ResultProductsQuery,
  RoutineDetail,
  RoutineGroup,
  RoutineRecommendationWithToken,
  RoutineSection,
  SaveRoutineRequest,
  SaveRoutineResponse,
  SurveyQuestion,
  SurveyResultInput,
  SurveySubmitPayload,
} from './types'

interface MockTopIngredientGroup {
  group: IngredientGroup
  score?: number
  priority: number
  ingredients: string[]
  reason: string
}

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

const CONCERN_LABELS: Record<Concern, string> = {
  DRY: 'Dryness',
  ACNE: 'Breakouts',
  PIGMENTATION: 'Pigmentation',
  AGING: 'Elasticity',
  SENSITIVE: 'Sensitivity',
  SEBUM: 'Excess Sebum',
  PORE: 'Visible Pores',
}

const INGREDIENT_GROUP_LABELS: Record<IngredientGroup, string> = {
  HYDRATION: 'Hydration',
  BARRIER: 'Barrier',
  ACNE: 'Blemish Care',
  SEBUM_CONTROL: 'Sebum Control',
  SOOTHING: 'Soothing',
  BRIGHTENING: 'Brightening',
  TURNOVER: 'Texture Care',
  ANTI_AGING: 'Elasticity Care',
}

const GROUP_INGREDIENTS: Record<IngredientGroup, string[]> = {
  HYDRATION: ['Hyaluronic Acid', 'Glycerin'],
  BARRIER: ['Ceramide', 'Panthenol'],
  ACNE: ['Salicylic Acid', 'Tea Tree'],
  SEBUM_CONTROL: ['Niacinamide', 'Zinc PCA'],
  SOOTHING: ['Centella', 'Allantoin'],
  BRIGHTENING: ['Vitamin C', 'Tranexamic Acid'],
  TURNOVER: ['PHA', 'Retinal'],
  ANTI_AGING: ['Peptide', 'Adenosine'],
}

const GROUP_REASONS: Record<IngredientGroup, string> = {
  HYDRATION: 'Helps replenish moisture and reduce tightness through the day.',
  BARRIER: 'Supports a stronger skin barrier and improves overall resilience.',
  ACNE: 'Targets congestion-prone areas while keeping the routine gentle.',
  SEBUM_CONTROL: 'Balances visible oil without stripping the skin.',
  SOOTHING: 'Helps calm reactivity and reduce day-to-day irritation.',
  BRIGHTENING: 'Supports a clearer tone and gradual spot care.',
  TURNOVER: 'Improves rough texture with a measured renewal step.',
  ANTI_AGING: 'Supports firmness and smoother-looking skin over time.',
}

const CONCERN_PRIMARY_GROUP: Record<Concern, IngredientGroup> = {
  DRY: 'HYDRATION',
  ACNE: 'ACNE',
  PIGMENTATION: 'BRIGHTENING',
  AGING: 'ANTI_AGING',
  SENSITIVE: 'SOOTHING',
  SEBUM: 'SEBUM_CONTROL',
  PORE: 'TURNOVER',
}

const SKIN_TYPE_FALLBACK_GROUPS: Record<SkinType, [IngredientGroup, IngredientGroup]> = {
  DRY: ['BARRIER', 'SOOTHING'],
  OILY: ['SEBUM_CONTROL', 'SOOTHING'],
  COMBINATION: ['HYDRATION', 'SEBUM_CONTROL'],
  SENSITIVE: ['BARRIER', 'SOOTHING'],
  UNKNOWN: ['HYDRATION', 'BARRIER'],
}

const RESULT_COPY_BY_SKIN_TYPE: Record<
  SkinType,
  {
    skinType: string
    subtitle: string
    summary: string
    subSummary: string
    routineTitle: string
    routineSummary: string
    caution: string
  }
> = {
  DRY: {
    skinType: 'Dry Skin Recovery Guide',
    subtitle: 'Hydration-first daily care',
    summary: 'Your skin is showing low hydration and a weaker moisture barrier. A cushioning hydration routine will keep the surface more comfortable throughout the day.',
    subSummary: 'Stack hydration first, then lock it in with a barrier-focused finish.',
    routineTitle: 'Dry Skin Recovery Routine',
    routineSummary: 'AM focuses on hydration support and PM layers barrier-repair steps for overnight comfort.',
    caution: 'Keep exfoliating acids to a low frequency until dryness improves.',
  },
  OILY: {
    skinType: 'Oily Skin Balance Guide',
    subtitle: 'Lightweight oil-control routine',
    summary: 'Your skin is producing excess oil and can feel congested quickly. A lighter routine with calming oil-control steps is the safer baseline.',
    subSummary: 'Keep the texture light, reduce congestion, and avoid over-stripping.',
    routineTitle: 'Oily Skin Balance Routine',
    routineSummary: 'AM stays fresh and light, while PM adds a more focused congestion-control step.',
    caution: 'Avoid stacking multiple high-strength actives on the same night.',
  },
  COMBINATION: {
    skinType: 'Combination Skin Balance Guide',
    subtitle: 'Hydration and oil balance together',
    summary: 'Your skin needs hydration support in some areas and oil control in others. A balanced routine helps reduce uneven texture without overloading the T-zone.',
    subSummary: 'Use flexible layers that hydrate dry areas while keeping the center of the face balanced.',
    routineTitle: 'Combination Skin Balance Routine',
    routineSummary: 'AM keeps the finish fresh, and PM adds richer barrier support only where needed.',
    caution: 'Adjust the amount of cream by zone instead of applying the same amount everywhere.',
  },
  SENSITIVE: {
    skinType: 'Sensitive Skin Comfort Guide',
    subtitle: 'Low-irritation soothing routine',
    summary: 'Your skin is reacting easily to daily triggers. A gentle soothing routine with barrier support is the safest path to better day-to-day comfort.',
    subSummary: 'Calm the skin first, then build a simple barrier-supporting routine around it.',
    routineTitle: 'Sensitive Skin Comfort Routine',
    routineSummary: 'AM emphasizes calm hydration and PM keeps the routine short with barrier recovery steps.',
    caution: 'Introduce any new active step slowly and patch test first.',
  },
  UNKNOWN: {
    skinType: 'Balanced Skin Support Guide',
    subtitle: 'Steady everyday maintenance',
    summary: 'Your current answers do not point strongly to one skin type, so the safer baseline is a balanced routine that maintains hydration and barrier comfort.',
    subSummary: 'Start with a balanced daily routine and adjust once your skin pattern becomes clearer.',
    routineTitle: 'Balanced Skin Support Routine',
    routineSummary: 'AM and PM stay simple, with reliable hydration and a comfortable finish.',
    caution: 'Make one product change at a time so you can observe how your skin responds.',
  },
}

type MockCatalogItem = {
  productId: number
  name: string
  brand: string
  price: number
  imageUrl: string | null
  category: ProductCategory
  reason: string
  categories: ResultProductsFilterCategory[]
  detail: ProductDetail
}

const MOCK_CATALOG: MockCatalogItem[] = [
  createCatalogItem(
    {
      productId: 201,
      name: 'Daily Skin Prep Water',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/201.png',
      description: 'A watery prep step designed for comfortable daily layering.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/201',
      price: 21000,
      category: 'TONER',
      reason: 'A lightweight first layer that helps soften the skin without heaviness.',
    },
    ['SKIN']
  ),
  createCatalogItem(
    {
      productId: 202,
      name: 'Calm Reset Toner',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/202.png',
      description: 'A calming toner that keeps the texture light and easy to layer.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/202',
      price: 22000,
      category: 'TONER',
      reason: 'Helps cool down reactivity and prep the skin for the next step.',
    },
    ['TONER']
  ),
  createCatalogItem(
    {
      productId: 203,
      name: 'Barrier Essence Shot',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/203.png',
      description: 'An essence-style treatment for reinforcing hydration and comfort.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/203',
      price: 28000,
      category: 'SERUM',
      reason: 'A cushioning essence step that supports hydration before serum.',
    },
    ['ESSENCE']
  ),
  createCatalogItem(
    {
      productId: 204,
      name: 'Repair Balance Serum',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/204.png',
      description: 'A concentrated serum for daily barrier support and skin balance.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/204',
      price: 32000,
      category: 'SERUM',
      reason: 'A focused serum step that targets barrier support and texture balance.',
    },
    ['SERUM']
  ),
  createCatalogItem(
    {
      productId: 205,
      name: 'Cica Recovery Ampoule',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/205.png',
      description: 'An ampoule-style treatment for comfort-focused evening care.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/205',
      price: 34000,
      category: 'SERUM',
      reason: 'A richer treatment texture for nights when the skin needs extra support.',
    },
    ['AMPOULE']
  ),
  createCatalogItem(
    {
      productId: 206,
      name: 'Light Balance Lotion',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/206.png',
      description: 'A lightweight emollient finish for balanced daily use.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/206',
      price: 26000,
      category: 'CREAM',
      reason: 'A light lotion finish that keeps the skin comfortable without weight.',
    },
    ['LOTION']
  ),
  createCatalogItem(
    {
      productId: 207,
      name: 'Moisture Shield Emulsion',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/207.png',
      description: 'An emulsion texture that bridges hydration and sealing care.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/207',
      price: 27000,
      category: 'CREAM',
      reason: 'Adds a flexible moisture layer that still feels easy to wear.',
    },
    ['EMULSION']
  ),
  createCatalogItem(
    {
      productId: 208,
      name: 'Ceramide Comfort Cream',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/208.png',
      description: 'A barrier-focused cream for a more sealed finish.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/208',
      price: 30000,
      category: 'CREAM',
      reason: 'A richer cream finish that helps reduce overnight dryness.',
    },
    ['CREAM']
  ),
  createCatalogItem(
    {
      productId: 209,
      name: 'Soft UV Guard',
      brand: 'Skin Lab',
      imageUrl: 'https://cdn.example.com/products/209.png',
      description: 'A daily sunscreen designed to sit comfortably under makeup.',
      createdDate: '2026-04-24',
      purchaseUrl: 'https://example.com/products/209',
      price: 24000,
      category: 'SUNSCREEN',
      reason: 'Daily UV protection with a comfortable finish and low-white-cast texture.',
    },
    ['SUN_CARE']
  ),
]

const MOCK_CATALOG_MAP = new Map<number, MockCatalogItem>(MOCK_CATALOG.map((item) => [item.productId, item]))

interface PreviewRecord {
  payload: SurveySubmitPayload
}

interface StoredResult {
  detail: ResultDetail
  skinType: SkinType
  concerns: Concern[]
}

let mockResultSequence = 700

const mockPreviewDb = new Map<string, PreviewRecord>()
const mockResultsDb = new Map<number, StoredResult>()

function createCatalogItem(
  spec: ProductDetail & { price: number; category: ProductCategory; reason: string },
  categories: ResultProductsFilterCategory[]
): MockCatalogItem {
  const { price, category, reason, ...detail } = spec
  return {
    productId: detail.productId,
    name: detail.name,
    brand: detail.brand,
    price,
    imageUrl: detail.imageUrl,
    category,
    reason,
    categories,
    detail,
  }
}

function withDelay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms)
  })
}


function createResultId(): number {
  mockResultSequence += 1
  return mockResultSequence
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

function buildTop3(skinType: SkinType, concerns: Concern[]): MockTopIngredientGroup[] {
  const primaryGroup = concerns[0] ? CONCERN_PRIMARY_GROUP[concerns[0]] : SKIN_TYPE_FALLBACK_GROUPS[skinType][0]
  const [fallback1, fallback2] = SKIN_TYPE_FALLBACK_GROUPS[skinType]
  const groups = [...new Set([primaryGroup, fallback1, fallback2])].slice(0, 3)

  return groups.map((group, index) => ({
    group,
    score: Number((0.96 - index * 0.08).toFixed(2)),
    priority: index + 1,
    ingredients: GROUP_INGREDIENTS[group],
    reason: GROUP_REASONS[group],
  }))
}

function createPreviewResult(payload: SurveySubmitPayload): PreviewResult {
  const copy = RESULT_COPY_BY_SKIN_TYPE[payload.skinType]
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return {
    diagnosedDate: `${yyyy}.${mm}.${dd}`,
    skinType: copy.skinType,
    subtitle: copy.subtitle,
    summary: copy.summary,
  }
}

function toIngredientMetas(top3: MockTopIngredientGroup[]): ResultIngredientMeta[] {
  return top3.slice(0, 3).map((item) => ({
    name: item.ingredients[0] ?? INGREDIENT_GROUP_LABELS[item.group],
    description: item.reason,
  }))
}

function toConcernLabels(concerns: Concern[]): string[] {
  if (concerns.length === 0) {
    return ['Balanced Care']
  }

  return concerns.slice(0, 3).map((concern) => CONCERN_LABELS[concern])
}

function createResultDetail(payload: SurveySubmitPayload, resultId: number): ResultDetail {
  const copy = RESULT_COPY_BY_SKIN_TYPE[payload.skinType]
  const top3 = buildTop3(payload.skinType, payload.concerns)

  return {
    resultId,
    diagnosedAt: new Date().toISOString(),
    skinType: copy.skinType,
    subtitle: copy.subtitle,
    summary: copy.summary,
    concerns: toConcernLabels(payload.concerns),
    subSummary: copy.subSummary,
    ingredientMetas: toIngredientMetas(top3),
  }
}

function getStoredResult(resultId: number): StoredResult {
  const stored = mockResultsDb.get(resultId)
  if (!stored) {
    throw new ApiError(`Result not found. (ID: ${resultId})`, 404, 'RESULT_NOT_FOUND')
  }

  return stored
}

function createRoutineProducts(
  productIds: number[],
  reasons: string[],
  notes: string[],
): RoutineDetail['products'] {
  return productIds.map((productId, index) => {
    const item = MOCK_CATALOG_MAP.get(productId)
    if (!item) {
      throw new ApiError(`Product not found. (ID: ${productId})`, 404, 'PRODUCT_NOT_FOUND')
    }

    return {
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      category: item.category,
      imageUrl: item.imageUrl,
      sortOrder: index + 1,
      reason: reasons[index] ?? item.reason,
      note: notes[index] ?? 'Use a thin, even layer and adjust by skin condition.',
      price: item.price,
    }
  })
}

interface MockRoutineProductSpec {
  productId: number
  productCategory: RoutineRecommendationWithToken['recommendation']['amRoutine']['products'][number]['productCategory']
  routineStepCategory: RoutineRecommendationWithToken['recommendation']['amRoutine']['products'][number]['routineStepCategory']
}

function buildRoutineSection(
  specs: MockRoutineProductSpec[],
  type: 'AM' | 'PM',
): RoutineSection {
  return {
    routineType: type,
    products: specs.map((spec) => {
      const item = MOCK_CATALOG_MAP.get(spec.productId)
      if (!item) {
        throw new ApiError(`Product not found. (ID: ${spec.productId})`, 404, 'PRODUCT_NOT_FOUND')
      }
      return {
        productId: item.productId,
        name: item.name,
        productCategory: spec.productCategory,
        imageUrl: item.imageUrl,
        routineStepCategory: spec.routineStepCategory,
      }
    }),
  }
}

function createRoutineRecommendationWithToken(stored: StoredResult): RoutineRecommendationWithToken {
  const copy = RESULT_COPY_BY_SKIN_TYPE[stored.skinType]

  const amSpecs: MockRoutineProductSpec[] = [
    { productId: 202, productCategory: 'TONER', routineStepCategory: 'PREPARE' },
    { productId: 204, productCategory: 'SERUM', routineStepCategory: 'INTENSIVE_CARE' },
    { productId: 209, productCategory: 'SUN_CARE', routineStepCategory: 'SUN_CARE' },
  ]

  const pmSpecs: MockRoutineProductSpec[] = [
    { productId: 202, productCategory: 'TONER', routineStepCategory: 'PREPARE' },
    { productId: 205, productCategory: 'AMPOULE', routineStepCategory: 'INTENSIVE_CARE' },
    { productId: 208, productCategory: 'CREAM', routineStepCategory: 'MOISTURIZER' },
  ]

  return {
    recommendation: {
      resultId: stored.detail.resultId,
      skinType: copy.skinType,
      subtitle: copy.subtitle,
      routineSummary: copy.routineSummary,
      amRoutine: buildRoutineSection(amSpecs, 'AM'),
      pmRoutine: buildRoutineSection(pmSpecs, 'PM'),
    },
    previewToken: `mock-routine-token-${stored.detail.resultId}`,
  }
}

function createRoutineGroup(resultId: number, stored: StoredResult): RoutineGroup {
  const copy = RESULT_COPY_BY_SKIN_TYPE[stored.skinType]

  return {
    routineGroupId: resultId,
    resultId,
    skinType: stored.skinType,
    title: copy.routineTitle,
    summary: copy.routineSummary,
    caution: copy.caution,
    createdAt: stored.detail.diagnosedAt,
    amRoutine: {
      routineId: resultId * 10 + 1,
      routineType: 'AM',
      memo: 'Keep the texture light and finish with daily UV protection.',
      products: createRoutineProducts(
        [202, 204, 209],
        [
          'Use a calming toner first to settle the skin and prepare the surface.',
          'Add a focused serum to support balance without over-layering.',
          'Seal the morning routine with comfortable UV protection.',
        ],
        [
          'Press in a thin first layer and repeat once on dry areas.',
          'Concentrate on the center of the face and reactive areas.',
          'Apply generously as the final step every morning.',
        ]
      ),
    },
    pmRoutine: {
      routineId: resultId * 10 + 2,
      routineType: 'PM',
      memo: 'Evening steps can be a touch richer so the skin wakes up more comfortable.',
      products: createRoutineProducts(
        [202, 205, 208],
        [
          'Reset the skin with a calming prep step before heavier layers.',
          'Use a richer treatment texture at night when the skin needs recovery.',
          'Finish with a barrier cream to reduce overnight moisture loss.',
        ],
        [
          'Keep the toner step light and comfortable.',
          'Layer only on the areas that need the most support.',
          'Adjust the amount based on dryness and indoor conditions.',
        ]
      ),
    },
  }
}

function createMockResultProductsPage(query: ResultProductsQuery, stored: StoredResult): ResultProductsPageData {
  const filteredProducts =
    query.categories && query.categories.length > 0
      ? MOCK_CATALOG.filter((product) => query.categories?.some((category) => product.categories.includes(category)))
      : MOCK_CATALOG

  const pageSize = Math.max(1, query.size)
  const startIndex =
    query.cursor === undefined
      ? 0
      : Math.max(
          filteredProducts.findIndex((product) => product.productId === query.cursor) + 1,
          0,
        )
  const endIndex = startIndex + pageSize
  const pageItems = filteredProducts.slice(startIndex, endIndex).map((product) => ({
    productId: product.productId,
    name: product.name,
    brand: product.brand,
    price: product.price,
    imageUrl: product.imageUrl,
  }))
  const lastProduct = pageItems.at(-1)

  return {
    skinResultDate: stored.detail.diagnosedAt.slice(0, 10),
    products: pageItems,
    hasNext: endIndex < filteredProducts.length,
    nextCursor: lastProduct ? lastProduct.productId : null,
  }
}

export const mockApiClient: ApiClient = {
  async getSurveyQuestions() {
    return withDelay(attachOptionCodes(MOCK_SURVEY_QUESTIONS))
  },

  async submitSurveyPreview(payload: SurveySubmitPayload): Promise<PreviewApiData> {
    const preview = createPreviewResult(payload)
    const previewToken = crypto.randomUUID()
    mockPreviewDb.set(previewToken, { payload })
    return withDelay({ preview, previewToken })
  },

  async submitSurveyResult(input: SurveyResultInput): Promise<ResultDetail> {

    if ('previewToken' in input) {
      const previewRecord = mockPreviewDb.get(input.previewToken)
      if (!previewRecord) {
        throw new ApiError('Preview result not found.', 404, 'PREVIEW_NOT_FOUND')
      }

      const resultId = createResultId()
      const detail = createResultDetail(previewRecord.payload, resultId)
      mockResultsDb.set(resultId, {
        detail,
        skinType: previewRecord.payload.skinType,
        concerns: previewRecord.payload.concerns,
      })
      return withDelay(detail)
    }

    const resultId = createResultId()
    const detail = createResultDetail(input, resultId)

    mockResultsDb.set(resultId, {
      detail,
      skinType: input.skinType,
      concerns: input.concerns,
    })

    return withDelay(detail)
  },

  async getResult(resultId: number): Promise<ResultDetail> {
    return withDelay(getStoredResult(resultId).detail)
  },

  async getRoutineGroup(resultId: number): Promise<RoutineGroup> {
    const stored = getStoredResult(resultId)
    return withDelay(createRoutineGroup(resultId, stored))
  },

  async getRoutineRecommendation(): Promise<RoutineRecommendationWithToken> {
    const latestId = mockResultSequence
    const stored = mockResultsDb.get(latestId)
    if (!stored) {
      throw new ApiError('No recommendation found. Please complete the survey first.', 404, 'RESULT_NOT_FOUND')
    }
    return withDelay(createRoutineRecommendationWithToken(stored))
  },

  async saveRoutine(request: SaveRoutineRequest): Promise<SaveRoutineResponse> {
    void request
    const groupId = mockResultSequence * 100 + 1
    return withDelay({
      routineGroupId: groupId,
      title: request.title,
      message: '루틴이 저장되었습니다.',
    })
  },

  async getRecommendedProducts(query: ResultProductsQuery): Promise<ResultProductsPageData> {
    const stored = getStoredResult(query.skinResultId)
    return withDelay(createMockResultProductsPage(query, stored))
  },

  async getProfile(): Promise<ProfileData> {
    const latestId = mockResultSequence
    const stored = mockResultsDb.get(latestId)
    if (!stored) {
      throw new ApiError('No profile found. Please complete the survey first.', 404, 'PROFILE_NOT_FOUND')
    }
    const copy = RESULT_COPY_BY_SKIN_TYPE[stored.skinType]
    return withDelay({
      resultId: stored.detail.resultId,
      diagnosedAt: stored.detail.diagnosedAt,
      skinType: copy.skinType,
      subtitle: copy.subtitle,
      summary: copy.summary,
    })
  },

  async getProductDetail(productId: number): Promise<ProductDetail> {
    const item = MOCK_CATALOG_MAP.get(productId)
    if (!item) {
      throw new ApiError(`Product not found. (ID: ${productId})`, 404, 'PRODUCT_NOT_FOUND')
    }

    return withDelay(item.detail)
  },

  async getMe(): Promise<AuthUser> {
    return withDelay({
      userId: 1,
      nickname: '레이어드 사용자',
      role: 'USER',
      profileImageUrl: null,
    })
  },

  async logout(): Promise<void> {
    return withDelay(undefined as unknown as void)
  },
}
