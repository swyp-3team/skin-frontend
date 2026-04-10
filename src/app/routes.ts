export const APP_ROUTES = {
  home: "/",
  survey: "/survey",
  surveySteps: "/survey/steps",
  surveyResult: "/survey/result",
  myPage: "/mypage",
  routineDetail: "/routines/:id",
  routineProducts: "/routines/:id/products",
  productDetail: "/products/:id",
} as const;

export const createRoutineDetailPath = (id: string | number) => `/routines/${id}`;

export const createRoutineProductsPath = (id: string | number) =>
  `/routines/${id}/products`;

export const createProductDetailPath = (id: string | number) => `/products/${id}`;
