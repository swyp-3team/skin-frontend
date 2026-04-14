export const SURVEY_QUESTION_STEP_COUNT = 4

/** 설문 문항에 공통으로 사용되는 5점 척도 선택지 (임시 더미 — 추후 API로 대체) */
export const MOCK_QUESTION_OPTIONS = [
  { value: 85, label: '매우 그렇다' },
  { value: 70, label: '그렇다' },
  { value: 55, label: '보통이다' },
  { value: 40, label: '아니다' },
  { value: 25, label: '전혀 아니다' },
] as const

/** 설문 질문 목록 더미 데이터 (임시 — 추후 API로 대체) */
export const MOCK_SURVEY_QUESTIONS = [
  { questionId: 1, text: '세안 직후 피부가 당기나요?', options: [...MOCK_QUESTION_OPTIONS] },
  { questionId: 2, text: '오후가 되면 번들거림이 느껴지나요?', options: [...MOCK_QUESTION_OPTIONS] },
  { questionId: 3, text: '트러블이 자주 올라오나요?', options: [...MOCK_QUESTION_OPTIONS] },
  { questionId: 4, text: '피부가 쉽게 붉어지거나 자극을 받나요?', options: [...MOCK_QUESTION_OPTIONS] },
] as const

export const SURVEY_QUERY_KEYS = {
  questions: (step: number) => ['surveyQuestions', step],
  stepConfig: ['surveyStepConfig'],
} as const

export const SURVEY_STEP_TEXT = {
  previous: '이전',
  next: '다음',
  submit: '결과 확인하기',
  submitPending: '제출 중...',
} as const

export const SURVEY_VALIDATION_MESSAGES = {
  questionRequired: '해당 문항의 응답을 선택해주세요.',
  skinTypeRequiredForStep: '피부 타입을 선택해주세요.',
  missingAnswers: '응답하지 않은 문항이 있습니다. 먼저 응답을 완료해주세요.',
  skinTypeRequiredForSubmit: '피부 타입 선택이 필요합니다.',
  skinTypeRequiredBeforeSubmit: '피부 타입을 먼저 선택해주세요.',
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
