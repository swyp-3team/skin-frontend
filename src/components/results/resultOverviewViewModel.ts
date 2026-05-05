import type { PreviewResult, ResultDetail, ResultIngredientMeta } from '@/api/types'

interface ResultOverviewTopViewModel {
  diagnosedDate: string | null
  title: string
  summary: string
  imageUrl: string | null
}

interface ResultOverviewRoutineViewModel {
  sectionTitle: string
  highlights: string[]
  highlightDescription: string
  ctaLabel: string
}

export interface ResultOverviewIngredientCardViewModel {
  rank: number
  name: string
  description: string
  isPrimary: boolean
}

interface ResultOverviewIngredientsViewModel {
  sectionTitle: string
  cards: ResultOverviewIngredientCardViewModel[]
  ctaLabel: string
}

export interface ResultOverviewViewModel {
  top: ResultOverviewTopViewModel
  routine: ResultOverviewRoutineViewModel
  ingredients: ResultOverviewIngredientsViewModel
}

const RESULT_PAGE_COPY = {
  routineSectionTitle: '지금 피부에 필요한 스킨케어 루틴은?',
  routineCta: '자세한 루틴 추천 받기',
  ingredientsSectionTitle: '사용하면 좋은 성분이에요',
  productsCta: '피부에 맞는 제품 찾기',
} as const

const PREVIEW_PLACEHOLDER_HIGHLIGHTS = ['예시1', '예시2', '예시3'] as const

const PREVIEW_PLACEHOLDER_DESCRIPTIONS = "미리보기 화면입니다. 로그인 하고 모든 결과를 확인하세요. 미리보기 화면입니다. 로그인 하고 모든 결과를 확인하세요. 미리보기 화면입니다. 로그인 하고 모든 결과를 확인하세요. "

const PREVIEW_PLACEHOLDER_CARDS = [
  {
    name: '성분1',
    description:
      '미리보기 화면입니다. 로그인 하고 모든 결과를 확인하세요.',
  },
  {
    name: '성분1',
    description:
      '미리보기 화면입니다. 로그인 하고 모든 결과를 확인하세요.',
  },
  {
    name: '성분1',
    description:
      '미리보기 화면입니다. 로그인 하고 모든 결과를 확인하세요.',
  },
] as const

const RESULT_IMAGE_URL_BY_TITLE: Record<string, string> = {
  '촉촉한 수분 결핍형': '/images/results/HYDRATION.png',
  '예민한 장벽 위기형': '/images/results/BARRIER.png',
  '열정적인 피지 활동형': '/images/results/ACNE.png',
  '수분은 있지만 트러블 동반형': '/images/results/ACNE_HYDRATION.png',
  '반반 섞인 이중 피부형': '/images/results/SEBUMCONTROL_HYDRATION.png',
  '번들번들 피지 과잉형': '/images/results/SEBUMCONTROL.png',
  '칙칙한 색소 고민형': '/images/results/BRIGHTENING.png',
  '환해지고 싶은 톤업 집중형': '/images/results/BRIGHTENING_ANTIAGING.png',
  '탱탱함이 그리운 탄력 저하형': '/images/results/ANTIAGING.png',
  '노화와 색소 이중 고민형': '/images/results/ANTIAGING_BRIGHTENING.png',
  '붉고 예민한 홍조 민감형': '/images/results/SOOTHING.png',
  '건조한데 트러블도 나는 복잡형': '/images/results/HYDRATION_ACNE.png',
  'Dry Skin Recovery Guide': '/images/results/HYDRATION.png',
  'Sensitive Skin Comfort Guide': '/images/results/BARRIER.png',
  'Oily Skin Balance Guide': '/images/results/SEBUMCONTROL.png',
  'Combination Skin Balance Guide': '/images/results/SEBUMCONTROL_HYDRATION.png',
  'Balanced Skin Support Guide': '/images/results/HYDRATION.png',
}

const NORMALIZED_RESULT_IMAGE_URL_BY_TITLE = Object.fromEntries(
  Object.entries(RESULT_IMAGE_URL_BY_TITLE).map(([title, imageUrl]) => [title.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase(), imageUrl]),
) as Record<string, string>

function toDateLabel(value: string): string | null {
  const isoParsedDate = new Date(value)
  if (!Number.isNaN(isoParsedDate.getTime())) {
    const year = isoParsedDate.getFullYear()
    const month = String(isoParsedDate.getMonth() + 1).padStart(2, '0')
    const day = String(isoParsedDate.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  const normalizedDate = value.match(/^(\d{4})[./-](\d{2})[./-](\d{2})$/)
  if (!normalizedDate) {
    return null
  }

  const [, year, month, day] = normalizedDate
  return `${year}.${month}.${day}`
}

function toIngredientCardsFromMetas(ingredientMetas: ResultIngredientMeta[]): ResultOverviewIngredientCardViewModel[] {
  const cards = ingredientMetas.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    name: item.name,
    description: item.description,
    isPrimary: index === 0,
  }))

  const missingCardCount = 3 - cards.length
  if (missingCardCount <= 0) {
    return cards
  }

  const placeholders = PREVIEW_PLACEHOLDER_CARDS.slice(0, missingCardCount).map((placeholder, index) => ({
    rank: cards.length + index + 1,
    name: placeholder.name,
    description: placeholder.description,
    isPrimary: cards.length + index === 0,
  }))

  return [...cards, ...placeholders]
}

function normalizeHighlights(highlights: string[]): string[] {
  const normalized = highlights.filter((item) => item.trim().length > 0).slice(0, 3)

  if (normalized.length >= 3) {
    return normalized
  }

  const needed = 3 - normalized.length
  return [...normalized, ...PREVIEW_PLACEHOLDER_HIGHLIGHTS.slice(0, needed)]
}

function toImageUrl(value?: string | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

function normalizeTitleKey(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()
}

function resolveTitleImageUrl(title: string): string | null {
  const normalizedTitle = normalizeTitleKey(title)
  return NORMALIZED_RESULT_IMAGE_URL_BY_TITLE[normalizedTitle] ?? null
}

function resolveTopImageUrl(title: string, imageUrl?: string | null): string | null {
  const imageFromApi = toImageUrl(imageUrl)
  if (imageFromApi) {
    return imageFromApi
  }

  return resolveTitleImageUrl(title)
}

export function fromResultDetail(result: ResultDetail): ResultOverviewViewModel {
  return {
    top: {
      diagnosedDate: toDateLabel(result.diagnosedAt),
      title: result.skinType,
      summary: result.summary,
      imageUrl: resolveTopImageUrl(result.skinType, result.imageUrl),
    },
    routine: {
      sectionTitle: RESULT_PAGE_COPY.routineSectionTitle,
      highlights: normalizeHighlights(result.concerns),
      highlightDescription: result.subSummary,
      ctaLabel: RESULT_PAGE_COPY.routineCta,
    },
    ingredients: {
      sectionTitle: RESULT_PAGE_COPY.ingredientsSectionTitle,
      cards: toIngredientCardsFromMetas(result.ingredientMetas),
      ctaLabel: RESULT_PAGE_COPY.productsCta,
    },
  }
}

export function fromPreviewResult(preview: PreviewResult): ResultOverviewViewModel {
  return {
    top: {
      diagnosedDate: toDateLabel(preview.diagnosedDate),
      title: preview.skinType,
      summary: preview.summary,
      imageUrl: resolveTopImageUrl(preview.skinType, preview.imageUrl),
    },
    routine: {
      sectionTitle: RESULT_PAGE_COPY.routineSectionTitle,
      highlights: normalizeHighlights([...PREVIEW_PLACEHOLDER_HIGHLIGHTS]),
      highlightDescription: PREVIEW_PLACEHOLDER_DESCRIPTIONS,
      ctaLabel: RESULT_PAGE_COPY.routineCta,
    },
    ingredients: {
      sectionTitle: RESULT_PAGE_COPY.ingredientsSectionTitle,
      cards: toIngredientCardsFromMetas([]),
      ctaLabel: RESULT_PAGE_COPY.productsCta,
    },
  }
}
