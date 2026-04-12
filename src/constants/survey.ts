export const SURVEY_QUERY_KEYS = {
  questions: ['surveyQuestions'],
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

export const SURVEY_STATUS_MESSAGES = {
  loadingQuestions: '설문 문항을 불러오는 중입니다...',
  loadQuestionsFailed: '설문 문항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  emptyResultTitle: '설문 결과가 없습니다',
  emptyResultDescription: '설문 완료 후 이 페이지에서 루틴과 제품 추천 결과를 확인할 수 있습니다.',
  viewResultCta: '진단 결과 보기',
} as const
