export interface HomeStep {
  order: string
  title: string
  description: string
}

export interface IngredientChipItem {
  category: string
  ingredient: string
}

export const HOME_CONTENT = {
  hero: {
    badge: '개인 맞춤 스킨케어',
    headlineLines: ['피부 고민을 입력하면', '나에게 맞는', '성분과 루틴을 알려드려요'],
    description: '내 피부를 몰라도 괜찮아요.\n고민을 입력하면 맞는 성분부터 루틴을 찾아드려요.',
    primaryCta: '지금 진단 시작하기',
  },
  howItWorks: {
    eyebrow: 'How it works',
    titleLines: ['3단계로 완성하는', '나만의 스킨케어 루틴'],
    steps: [
      {
        order: '01',
        title: '피부 진단 설문',
        description: '로그인 없이, 증상 기반 15가지 질문으로\n피부 타입과 고민을 파악해요.',
      },
      {
        order: '02',
        title: '성분 추천',
        description:
          '진단 결과를 바탕으로 나의 피부 상태에 최적화된 성분군을 우선순위별로 추천해드려요. 필요한 성분이 무엇인지, 왜 필요한지 알려드려요.',
      },
      {
        order: '03',
        title: '아침·저녁 루틴 가이드',
        description: '토너부터 선크림까지, 카테고리별로 어떤 성분을 어떤 순서로 써야 하는지 안내해드려요.',
      },
    ] satisfies readonly HomeStep[],
  },
  ingredientEngine: {
    eyebrow: 'Ingredient Engine',
    titleLines: ['성분 중심으로', '나의 피부를 이해해요'],
    description: '브랜드가 아닌 성분으로 추천해요. 피부 상태에서 시작해 필요한 성분군을 도출하고, 맞는 제품을 찾아드려요.',
  },
  resultPreview: {
    eyebrow: 'Result Preview',
    titleLines: ['진단 후 바로 확인하는', '나의 피부 분석'],
    description: '로그인 전에도 피부 타입, 고민 태그, 추천 성분군 상위 3개를 미리 볼 수 있어요. 전체 루틴과 제품 추천은 로그인 후 확인해요.',
    cta: '무료로 진단받기',
  },
  finalCta: {
    titleLines: ['지금 내 피부 고민을', '입력해 보세요'],
    description: '로그인 없이 바로 시작할 수 있어요',
    cta: '피부 진단 시작하기',
  },
} as const

export const INGREDIENT_MARQUEE_ROWS: ReadonlyArray<ReadonlyArray<IngredientChipItem>> = [
  [
    { category: '수분', ingredient: '히알루론산' },
    { category: '수분', ingredient: '글리세린' },
    { category: '수분', ingredient: '베타글루칸' },
    { category: '진정', ingredient: '센텔라' },
  ],
  [
    { category: '진정', ingredient: '판테놀' },
    { category: '진정', ingredient: '아줄렌' },
    { category: '피지', ingredient: '나이아신아마이드' },
    { category: '피지', ingredient: '징크' },
  ],
  [
    { category: '장벽', ingredient: '세라마이드' },
    { category: '장벽', ingredient: '콜레스테롤' },
    { category: '장벽', ingredient: '지방산 복합체' },
    { category: '보습', ingredient: '스쿠알란' },
  ],
]
