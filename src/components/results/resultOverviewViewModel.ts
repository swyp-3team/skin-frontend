import resultSafeImage from '@/assets/images/result-safe.png'
import type { PreviewResult, ResultDetail, TopIngredientGroup } from '@/api/types'
import { INGREDIENT_GROUP_LABELS } from '@/domain/surveyConfig'
import type { SkinType } from '@/types/domain'

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
  routineSectionTitle: '지금 피부에\n필요한 스킨케어 루틴은?',
  routineCta: '자세한 루틴 추천 받기',
  ingredientsSectionTitle: '사용하면 좋은 성분이에요',
  productsCta: '나에게 맞는 제품 찾기',
} as const

const SKIN_TYPE_TITLES: Record<SkinType, string> = {
  DRY: '건조함이 쉽게 느껴지는 피부',
  OILY: '번들거림이 자주 올라오는 피부',
  COMBINATION: '유수분 균형이 필요한 피부',
  SENSITIVE: '외부 자극에 쉽게 반응하는 피부',
  UNKNOWN: '현재 피부 타입을 확인 중이에요',
}

const PREVIEW_PLACEHOLDER_HIGHLIGHTS = ['속건조', '장벽 약화', '피부 당김'] as const

const PREVIEW_PLACEHOLDER_CARDS = [
  {
    name: '베타글루칸',
    description:
      '귀리나 효모에서 추출한 성분으로 수분 공급과 피부 장벽 회복에 도움을 줄 수 있어요.',
  },
  {
    name: '판테놀',
    description:
      '피부 보호막을 지지하고 예민해진 피부를 편안하게 진정시키는 데 도움을 줄 수 있어요.',
  },
  {
    name: '세라마이드',
    description:
      '수분 손실을 줄이고 피부 장벽을 보완해 건조로 인한 불편함을 완화하는 데 도움을 줄 수 있어요.',
  },
] as const

function toDateLabel(value: string): string | null {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function toIngredientName(item: TopIngredientGroup): string {
  const firstIngredient = item.ingredients.find((ingredient) => ingredient.trim().length > 0)
  if (firstIngredient) {
    return firstIngredient
  }

  return INGREDIENT_GROUP_LABELS[item.group]
}

function toIngredientCards(top3: TopIngredientGroup[]): ResultOverviewIngredientCardViewModel[] {
  const cards = top3.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    name: toIngredientName(item),
    description: item.reason,
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
  const highlights = result.top3.map((item) => INGREDIENT_GROUP_LABELS[item.group])
  const ingredientCards = toIngredientCards(result.top3)

  return {
    top: {
      diagnosedDate: toDateLabel(result.resultSummary.createdAt),
      title: result.resultSummary.title,
      summary: result.summary,
      imageUrl: resultSafeImage,
    },
    routine: {
      sectionTitle: RESULT_PAGE_COPY.routineSectionTitle,
      highlights: normalizeHighlights(highlights),
      highlightDescription: result.top3[0]?.reason ?? result.summary,
      ctaLabel: RESULT_PAGE_COPY.routineCta,
    },
    ingredients: {
      sectionTitle: RESULT_PAGE_COPY.ingredientsSectionTitle,
      cards: ingredientCards,
      ctaLabel: RESULT_PAGE_COPY.productsCta,
    },
  }
}

export function fromPreviewResult(preview: PreviewResult): ResultOverviewViewModel {
  const highlights = preview.top3.map((item) => INGREDIENT_GROUP_LABELS[item.group])
  const ingredientCards = toIngredientCards(preview.top3)

  return {
    top: {
      diagnosedDate: null,
      title: SKIN_TYPE_TITLES[preview.skinType],
      summary: preview.summary,
      imageUrl: resultSafeImage,
    },
    routine: {
      sectionTitle: RESULT_PAGE_COPY.routineSectionTitle,
      highlights: normalizeHighlights(highlights),
      highlightDescription: preview.top3[0]?.reason ?? preview.summary,
      ctaLabel: RESULT_PAGE_COPY.routineCta,
    },
    ingredients: {
      sectionTitle: RESULT_PAGE_COPY.ingredientsSectionTitle,
      cards: ingredientCards,
      ctaLabel: RESULT_PAGE_COPY.productsCta,
    },
  }
}
