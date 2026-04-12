import { cn } from '@/lib/utils'

interface ProductThumbnailProps {
  className?: string
}

function ProductThumbnail({ className }: ProductThumbnailProps) {
  return <div className={cn('size-16 rounded-[8px] bg-[#d9d9d9]', className)} />
}

export default ProductThumbnail
