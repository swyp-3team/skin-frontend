import { Link } from 'react-router-dom'

import type { RecommendedProduct } from '../../api/types'
import { createProductDetailPath } from '../../app/routes'
import ProductThumbnail from '../common/ProductThumbnail'

interface RecommendedProductsListProps {
  products: RecommendedProduct[]
}

function RecommendedProductsList({ products }: RecommendedProductsListProps) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <article
          className="flex items-center gap-3 rounded-[8px] border border-card-border bg-white p-2"
          key={product.productId}
        >
          <ProductThumbnail />
          <div className="min-w-0 flex-1">
            <p className="text-meta text-slate-500">[{product.category}]</p>
            <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-500">{product.reason}</p>
          </div>
          <Link
            className="rounded-[6px] px-2 py-1 text-meta font-semibold text-slate-700"
            to={createProductDetailPath(product.productId)}
          >
            상세보기
          </Link>
        </article>
      ))}
    </div>
  )
}

export default RecommendedProductsList
