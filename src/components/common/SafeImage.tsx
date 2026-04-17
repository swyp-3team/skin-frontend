import { useMemo, useState } from 'react'
import type { ImgHTMLAttributes, SyntheticEvent } from 'react'

import productPlaceholder from '@/assets/images/product-placeholder.svg'

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  fallbackSrc?: string
  fallbackAlt?: string
}

function normalizeSrc(value?: string | null) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

function SafeImage({
  src,
  fallbackSrc = productPlaceholder,
  fallbackAlt,
  alt,
  onError,
  ...props
}: SafeImageProps) {
  const normalizedSrc = useMemo(() => normalizeSrc(src), [src])
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const shouldUseFallback = !normalizedSrc || failedSource === normalizedSrc
  const resolvedSrc = shouldUseFallback ? fallbackSrc : normalizedSrc
  const resolvedAlt = shouldUseFallback ? (fallbackAlt ?? alt) : alt

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (shouldUseFallback) {
      event.currentTarget.onerror = null
    } else {
      setFailedSource(normalizedSrc)
    }

    onError?.(event)
  }

  return <img {...props} alt={resolvedAlt} onError={handleError} src={resolvedSrc} />
}

export default SafeImage
