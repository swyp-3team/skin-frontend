import { useCallback, useRef, useState } from 'react'

export function useScrollCollapse<T extends Element>(rootMargin = '0px', initialCollapsed = false) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (el: T | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null

      if (!el) return

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsCollapsed(!(entry?.isIntersecting ?? true))
        },
        { threshold: 0, rootMargin },
      )
      observerRef.current.observe(el)
    },
    [rootMargin],
  )

  return { ref, isCollapsed }
}
