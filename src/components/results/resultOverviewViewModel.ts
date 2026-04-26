import type { PreviewResult, ResultDetail, ResultIngredientMeta } from '@/api/types'
import safeguardImage from '@/assets/images/safeguard.png'

const RESULT_OVERVIEW_IMAGE_URL = safeguardImage

interface ResultOverviewTopViewModel {
  diagnosedDate: string | null
  title: string
  summary: string
  imageUrl: string
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

export function fromResultDetail(result: ResultDetail): ResultOverviewViewModel {
  return {
    top: {
      diagnosedDate: toDateLabel(result.diagnosedAt),
      title: result.skinType,
      summary: result.summary,
      imageUrl: RESULT_OVERVIEW_IMAGE_URL,
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
      imageUrl: RESULT_OVERVIEW_IMAGE_URL,
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
