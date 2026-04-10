interface ProductThumbnailProps {
  className?: string
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function ProductThumbnail({ className }: ProductThumbnailProps) {
  return <div className={joinClassNames('size-16 rounded-[8px] bg-[#d9d9d9]', className)} />
}

export default ProductThumbnail
