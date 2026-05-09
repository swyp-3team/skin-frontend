import { useEffect, type RefObject } from 'react'

export function useLandingStepReveal(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = pageRef.current
    if (!root) {
      return
    }

    const stepElements = Array.from(root.querySelectorAll<HTMLElement>('[data-landing-step]'))
    if (stepElements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          entry.target.classList.add('show')
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.2,
      },
    )

    stepElements.forEach((step) => observer.observe(step))

    return () => {
      observer.disconnect()
    }
  }, [pageRef])
}
