import { useEffect, useRef, type RefObject } from 'react'

interface UseWindowSnapToElementParams {
  targetRef: RefObject<HTMLElement | null>
  stickyOffset: number
  triggerThreshold: number
  enabled?: boolean
}

const SNAP_SETTLE_TIMEOUT_MS = 450
const SNAP_ALIGNMENT_TOLERANCE_PX = 1

export function useWindowSnapToElement({
  targetRef,
  stickyOffset,
  triggerThreshold,
  enabled = true,
}: UseWindowSnapToElementParams) {
  const lastWindowScrollYRef = useRef(0)
  const isAutoSnappingRef = useRef(false)
  const releaseTimeoutRef = useRef<number | null>(null)
  const settleFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) {
      return
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    lastWindowScrollYRef.current = window.scrollY

    const clearAutoSnap = () => {
      isAutoSnappingRef.current = false

      if (releaseTimeoutRef.current !== null) {
        window.clearTimeout(releaseTimeoutRef.current)
        releaseTimeoutRef.current = null
      }

      if (settleFrameRef.current !== null) {
        window.cancelAnimationFrame(settleFrameRef.current)
        settleFrameRef.current = null
      }
    }

    const waitForSnapToSettle = () => {
      const target = targetRef.current

      if (!target) {
        clearAutoSnap()
        return
      }

      const distanceToStickyLine = target.getBoundingClientRect().top - stickyOffset

      if (Math.abs(distanceToStickyLine) <= SNAP_ALIGNMENT_TOLERANCE_PX) {
        clearAutoSnap()
        return
      }

      settleFrameRef.current = window.requestAnimationFrame(waitForSnapToSettle)
    }

    const handleScroll = () => {
      const nextWindowScrollY = window.scrollY
      const isScrollingDown = nextWindowScrollY > lastWindowScrollYRef.current
      lastWindowScrollYRef.current = nextWindowScrollY

      if (!isScrollingDown || isAutoSnappingRef.current) {
        return
      }

      const target = targetRef.current

      if (!target) {
        return
      }

      const distanceToStickyLine = target.getBoundingClientRect().top - stickyOffset

      if (distanceToStickyLine <= 0 || distanceToStickyLine > triggerThreshold) {
        return
      }

      isAutoSnappingRef.current = true

      window.scrollTo({
        top: nextWindowScrollY + distanceToStickyLine,
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
      })

      if (reducedMotionQuery.matches) {
        clearAutoSnap()
        return
      }

      waitForSnapToSettle()
      releaseTimeoutRef.current = window.setTimeout(clearAutoSnap, SNAP_SETTLE_TIMEOUT_MS)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearAutoSnap()
    }
  }, [enabled, stickyOffset, targetRef, triggerThreshold])
}
