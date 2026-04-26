export const APP_ROUTES = {
  home: '/',
  landing: '/landing',
  survey: '/survey',
  surveySteps: '/survey/steps',
  surveyResult: '/survey/result',
  resultDetail: '/results/:id',
  resultRoutine: '/results/:id/routine',
  resultProducts: '/results/:id/products',
  resultProductsSearch: '/results/:id/products/search',
  myPage: '/mypage',
  routineDetail: '/mypage/routines/:id',
  productDetail: '/products/:id',
  authCallback: '/oauth2/callback',
} as const

export const createResultDetailPath = (id: string | number) => `/results/${id}`
export const createResultRoutinePath = (id: string | number) => `/results/${id}/routine`
export const createResultProductsPath = (id: string | number) => `/results/${id}/products`
export const createResultProductsSearchPath = (id: string | number) => `/results/${id}/products/search`

export const createRoutineDetailPath = (id: string | number) => `/mypage/routines/${id}`
export const createProductDetailPath = (id: string | number) => `/products/${id}`
