import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { apiClient } from '../../api'
import { queryKeys } from '../../lib/queryKeys'

export function useProductDetail() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)

  return {
    productId,
    ...useQuery({
      queryKey: queryKeys.productDetail(productId),
      queryFn: () => apiClient.getProductDetail(productId),
      enabled: !!id && Number.isFinite(productId),
      retry: false,
    }),
  }
}
