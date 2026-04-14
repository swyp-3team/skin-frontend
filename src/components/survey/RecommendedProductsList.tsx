import type { RecommendedProduct } from '../../api/types'
import { createProductDetailPath } from '../../app/routes'
import ProductCard from '../common/ProductCard'

interface RecommendedProductsListProps {
  products: RecommendedProduct[]
}

function RecommendedProductsList({ products }: RecommendedProductsListProps) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <ProductCard
          description={product.reason}
          href={createProductDetailPath(product.productId)}
          key={product.productId}
          label={product.category}
          name={product.name}
        />
      ))}
    </div>
  )
}

export default RecommendedProductsList
