import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import ProductThumbnail from './ProductThumbnail'

interface ProductCardProps {
  /** 카테고리·브랜드 등 대괄호 안에 표시되는 레이블 */
  label: string
  name: string
  description: string
  /** React Router 경로 */
  href: string
  className?: string
}

/**
 * 제품 목록 카드 — 썸네일 + 정보 + 상세보기 링크.
 * RecommendedProductsList, RoutineProductsPage 등에서 공통으로 사용.
 */
function ProductCard({ label, name, description, href, className }: ProductCardProps) {
  return (
    <article
      className={cn(
        'flex items-center gap-3 rounded-[8px] border border-neutral-200 bg-neutral-0 p-2',
        className,
      )}
    >
      <ProductThumbnail />
      <div className="min-w-0 flex-1">
        <p className="text-meta text-neutral-400">[{label}]</p>
        <p className="truncate text-sm font-medium text-neutral-800">{name}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
      <Link
        className={buttonVariants({ variant: 'tertiary', size: 'xs' })}
        to={href}
      >
        상세보기
      </Link>
    </article>
  )
}

export default ProductCard
