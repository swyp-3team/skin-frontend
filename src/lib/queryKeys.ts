export const queryKeys = {
  result: (id: number) => ['result', id] as const,
  routineGroup: (skinResultId: number) => ['routine-group', skinResultId] as const,
  resultProducts: (skinResultId: number) => ['result-products', skinResultId] as const,
  productDetail: (id: number) => ['product', id] as const,
} as const
