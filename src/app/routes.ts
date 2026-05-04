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
  myPageResults: '/mypage/results',
  myPageRoutines: '/mypage/routines',
  routineDetail: '/mypage/routines/:id',
  productDetail: '/products/:id',
  authCallback: '/oauth2/callback',
  terms: '/terms',
  privacy: '/privacy',
} as const

export const createResultDetailPath = (id: string | number) => `/results/${id}`
export const createResultRoutinePath = (id: string | number) => `/results/${id}/routine`
export const createResultProductsPath = (id: string | number) => `/results/${id}/products`
export const createResultProductsSearchPath = (id: string | number) => `/results/${id}/products/search`

export type RoutineDetailTab = 'am' | 'pm'

interface RoutineDetailPathOptions {
  tab?: RoutineDetailTab
}

export const createRoutineDetailPath = (id: string | number, options?: RoutineDetailPathOptions) => {
  const path = `/mypage/routines/${id}`
  if (!options?.tab) {
    return path
  }

  return `${path}?tab=${options.tab}`
}
export const createProductDetailPath = (id: string | number) => `/products/${id}`
