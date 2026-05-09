import { useEffect, type RefObject } from 'react'

const HERO_LAYER_PARALLAX_SPEEDS = [0.015, 0.02, 0.025] as const

export function useHeroParallax(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = pageRef.current
    if (!root) {
      return
    }

    const heroElement = root.querySelector<HTMLElement>('.hero')
    const layerElements = Array.from(root.querySelectorAll<HTMLElement>('.layer'))

    if (!heroElement || layerElements.length === 0) {
      return
    }

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionMediaQuery.matches) {
      return
    }

    let rafId = 0
    let isScheduled = false

    const updateLayers = () => {
      isScheduled = false

      const heroRect = heroElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const isHeroVisible = heroRect.bottom > 0 && heroRect.top < viewportHeight
      const scrollY = window.scrollY

      layerElements.forEach((layer, index) => {
        const speed =
          HERO_LAYER_PARALLAX_SPEEDS[index] ??
          HERO_LAYER_PARALLAX_SPEEDS[HERO_LAYER_PARALLAX_SPEEDS.length - 1]
        const offset = isHeroVisible ? scrollY * speed : 0
        layer.style.transform = `translateY(${offset.toFixed(2)}px)`
      })
    }

    const requestUpdate = () => {
      if (isScheduled) {
        return
      }

      isScheduled = true
      rafId = window.requestAnimationFrame(updateLayers)
    }

    const handleMotionPreferenceChange = () => {
      if (motionMediaQuery.matches) {
        layerElements.forEach((layer) => {
          layer.style.removeProperty('transform')
        })
        return
      }

      requestUpdate()
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    if (typeof motionMediaQuery.addEventListener === 'function') {
      motionMediaQuery.addEventListener('change', handleMotionPreferenceChange)
    } else {
      motionMediaQuery.addListener(handleMotionPreferenceChange)
    }

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)

      if (typeof motionMediaQuery.removeEventListener === 'function') {
        motionMediaQuery.removeEventListener('change', handleMotionPreferenceChange)
      } else {
        motionMediaQuery.removeListener(handleMotionPreferenceChange)
      }

      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [pageRef])
}
