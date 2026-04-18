export const queryKeys = {
  result: (id: number) => ['result', id] as const,
  productDetail: (id: number) => ['product', id] as const,
} as const
