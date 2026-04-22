import { useEffect, useRef, useState } from 'react'

export function useScrollCollapse<T extends Element>(rootMargin = '0px') {
  const ref = useRef<T>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!(entry?.isIntersecting ?? true))
      },
      { threshold: 0, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, isCollapsed }
}
