export const queryKeys = {
  surveyPreview: () => ['survey', 'preview'] as const,
  result: (id: number) => ['result', id] as const,
  productDetail: (id: number) => ['product', id] as const,
} as const
