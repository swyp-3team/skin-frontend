/** Q1~Q13에 공통으로 사용되는 5점 척도 선택지 */
const SCALE_OPTIONS = [
  { value: 1, label: '항상 그래요' },
  { value: 2, label: '자주 그런 편이에요' },
  { value: 3, label: '가끔 그래요' },
  { value: 4, label: '거의 없어요' },
  { value: 5, label: '전혀 없어요' },
] as const

/** 설문 전체 더미 데이터 (15개) — API 연동 전 목업용 */
export const MOCK_SURVEY_QUESTIONS = [
  { questionId: 1,  text: '세안 직후 피부가 당기나요?',                   options: [...SCALE_OPTIONS] },
  { questionId: 2,  text: '오후가 되면 번들거림이 느껴지나요?',           options: [...SCALE_OPTIONS] },
  { questionId: 3,  text: '트러블이 자주 올라오나요?',                    options: [...SCALE_OPTIONS] },
  { questionId: 4,  text: '피부가 쉽게 붉어지거나 자극을 받나요?',        options: [...SCALE_OPTIONS] },
  { questionId: 5,  text: '모공이 눈에 띄게 보이나요?',                   options: [...SCALE_OPTIONS] },
  { questionId: 6,  text: '피부 결이 거칠거나 각질이 일어나나요?',        options: [...SCALE_OPTIONS] },
  { questionId: 7,  text: '스킨케어 후에도 피부 당김이 느껴지나요?',      options: [...SCALE_OPTIONS] },
  { questionId: 8,  text: '자외선에 노출된 후 피부가 빠르게 자극받나요?', options: [...SCALE_OPTIONS] },
  { questionId: 9,  text: '피지 분비가 과도하게 느껴지나요?',             options: [...SCALE_OPTIONS] },
  { questionId: 10, text: '눈가나 이마에 잔주름이 보이나요?',             options: [...SCALE_OPTIONS] },
  { questionId: 11, text: '피부 톤이 칙칙하거나 잡티가 신경 쓰이나요?',  options: [...SCALE_OPTIONS] },
  { questionId: 12, text: '세안 후 보습 없이 피부가 당기나요?',           options: [...SCALE_OPTIONS] },
  { questionId: 13, text: '외출 후 피부가 민감하거나 따가운 느낌이 드나요?', options: [...SCALE_OPTIONS] },
  {
    questionId: 14,
    text: '피부 타입을 선택해주세요',
    options: [
      { value: 1, label: '건성' },
      { value: 2, label: '지성' },
      { value: 3, label: '복합성' },
      { value: 4, label: '민감성' },
    ],
  },
  {
    questionId: 15,
    text: '주요 피부 고민을 선택해주세요',
    options: [
      { value: 1, label: '건조' },
      { value: 2, label: '피지' },
      { value: 3, label: '트러블' },
      { value: 4, label: '민감' },
      { value: 5, label: '색소' },
      { value: 6, label: '노화' },
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
  questionId: number
  message: string
  toastId: string
}

export const SURVEY_STEP_MILESTONE_TOASTS: SurveyStepMilestoneToast[] = [
  { questionId: 4, message: '잘 하고 있어요!', toastId: 'survey-milestone-q4' },
  { questionId: 7, message: '벌써 절반이에요!', toastId: 'survey-milestone-q7' },
  { questionId: 11, message: '거의 다 왔어요!', toastId: 'survey-milestone-q11' },
  { questionId: 15, message: '마지막 질문이에요!', toastId: 'survey-milestone-q15' },
]

export const SURVEY_VALIDATION_MESSAGES = {
  questionRequired: '해당 문항의 응답을 선택해주세요.',
  missingAnswers: '응답하지 않은 문항이 있습니다. 먼저 응답을 완료해주세요.',
} as const

export const SURVEY_PAGE_TITLE = '피부 진단받기'

export const SURVEY_RESULT_COPY = {
  needSectionTitle: '필요',
  ingredientSummaryPlaceholder: 'HYDRATION',
  headingSuffix: '이 필요해요.',
  headingConnector: '와',
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
  emptyResultDescription: '설문 완료 후 이 페이지에서 루틴과 제품 추천 결과를 확인할 수 있습니다.',
  viewResultCta: '진단 결과 보기',
} as const
