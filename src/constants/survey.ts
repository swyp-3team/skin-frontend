/** Q1~Q13에서 공통으로 사용하는 5점 척도 선택지 */
const SCALE_OPTIONS = [
  { optionNumber: 1, content: '항상 그래요' },
  { optionNumber: 2, content: '자주 그런 편이에요' },
  { optionNumber: 3, content: '가끔 그래요' },
  { optionNumber: 4, content: '거의 없어요' },
  { optionNumber: 5, content: '전혀 없어요' },
] as const

/** 설문 전체 질문 데이터 (15개) */
export const MOCK_SURVEY_QUESTIONS = [
  { step: 1, question: '세안 직후 피부가 당기나요?', options: [...SCALE_OPTIONS] },
  { step: 2, question: '오후가 되면 얼굴에 유분이 많이 올라오나요?', options: [...SCALE_OPTIONS] },
  { step: 3, question: '트러블이 자주 올라오나요?', options: [...SCALE_OPTIONS] },
  { step: 4, question: '피부가 쉽게 붉어지거나 자극을 받나요?', options: [...SCALE_OPTIONS] },
  { step: 5, question: '모공이 눈에 띄게 보이나요?', options: [...SCALE_OPTIONS] },
  { step: 6, question: '피부결이 거칠거나 각질이 일어나나요?', options: [...SCALE_OPTIONS] },
  { step: 7, question: '스킨케어 후에도 피부 당김이 느껴지나요?', options: [...SCALE_OPTIONS] },
  { step: 8, question: '자외선 노출 후 피부가 민감해지나요?', options: [...SCALE_OPTIONS] },
  { step: 9, question: '피지 분비가 과도하게 느껴지나요?', options: [...SCALE_OPTIONS] },
  { step: 10, question: '눈가나 이마에 잔주름이 보이나요?', options: [...SCALE_OPTIONS] },
  { step: 11, question: '피부 톤이 칙칙하거나 잡티가 신경 쓰이나요?', options: [...SCALE_OPTIONS] },
  { step: 12, question: '보습을 해도 금방 건조해지나요?', options: [...SCALE_OPTIONS] },
  { step: 13, question: '외출 후 피부가 따갑거나 민감해지나요?', options: [...SCALE_OPTIONS] },
  {
    step: 14,
    question: '현재 고민을 선택해주세요',
    options: [
      { optionNumber: 1, content: '건조' },
      { optionNumber: 2, content: '트러블' },
      { optionNumber: 3, content: '색소/잡티' },
      { optionNumber: 4, content: '주름/노화' },
      { optionNumber: 5, content: '민감' },
      { optionNumber: 6, content: '피지' },
      { optionNumber: 7, content: '모공' },
    ],
  },
  {
    step: 15,
    question: '피부 타입을 선택해주세요',
    options: [
      { optionNumber: 1, content: '건성' },
      { optionNumber: 2, content: '지성' },
      { optionNumber: 3, content: '복합성' },
      { optionNumber: 4, content: '민감성' },
      { optionNumber: 5, content: '잘 모르겠어요' },
    ],
  },
] as const

export const SURVEY_QUERY_KEYS = {
  questions: ['surveyQuestions'],
} as const

export const SURVEY_STEP_TEXT = {
  previous: '이전',
  next: '다음',
  submit: '결과 확인하기',
  submitPending: '제출 중...',
} as const

export interface SurveyStepMilestoneToast {
  step: number
  message: string
  toastId: string
}

export const SURVEY_STEP_MILESTONE_TOASTS: SurveyStepMilestoneToast[] = [
  { step: 4, message: '좋아요, 계속 진행해요.', toastId: 'survey-milestone-q4' },
  { step: 7, message: '절반 정도 진행했어요.', toastId: 'survey-milestone-q7' },
  { step: 11, message: '거의 다 왔어요.', toastId: 'survey-milestone-q11' },
  { step: 15, message: '마지막 질문이에요.', toastId: 'survey-milestone-q15' },
]

export const SURVEY_VALIDATION_MESSAGES = {
  questionRequired: '해당 문항의 답변을 선택해주세요.',
  missingAnswers: '응답하지 않은 문항이 있습니다. 먼저 답변을 완료해주세요.',
} as const

export const SURVEY_PAGE_TITLE = '피부 진단받기'

export const SURVEY_RESULT_COPY = {
  needSectionTitle: '필요',
  ingredientSummaryPlaceholder: 'HYDRATION',
  headingSuffix: '이 필요해요.',
  headingConnector: '과',
  routineSectionTitle: '지금 피부에 필요한\n스킨케어 루틴은?',
  routineLinkCta: '추천 루틴 보기',
  productsLinkCta: '추천 제품 보기',
  routinePageTitle: '추천 루틴',
  amRoutineTitle: '아침',
  pmRoutineTitle: '저녁',
  saveRoutineCta: '루틴 저장하기',
  routineSavedCta: '마이페이지 바로가기',
  productsPageTitle: '추천 제품',
  moreProductsCta: '나에게 맞는 제품 더보기',
  submittingTitle: '피부를 분석하고 있어요',
  submittingDescription: '맞춤 성분과 루틴을 계산하는 중입니다...',
} as const

export const SURVEY_STATUS_MESSAGES = {
  loadingQuestions: '설문 문항을 불러오는 중입니다...',
  loadQuestionsFailed: '설문 문항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  emptyResultTitle: '설문 결과가 없습니다',
  emptyResultDescription: '설문 완료 후 결과 페이지에서 루틴과 제품 추천 결과를 확인할 수 있습니다.',
  viewResultCta: '진단 결과 보기',
} as const
