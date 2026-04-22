import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type StackPhase = 'stacking' | 'released'

interface RoutineStackMetrics {
  cardHeights: number[]
  naturalTops: number[]
  collapsedTops: number[]
  naturalCtaTop: number
  collapsedCtaTop: number
  stickyHeight: number
  trackHeight: number
  collapseDistance: number
  isReady: boolean
}

interface UseRoutineStackLayoutParams {
  cardCount: number
  headerHeight: number
  cardPeekHeight: number
  cardFlowGap: number
  ctaGap: number
  resetKey: string
}

const EMPTY_METRICS: RoutineStackMetrics = {
  cardHeights: [],
  naturalTops: [],
  collapsedTops: [],
  naturalCtaTop: 0,
  collapsedCtaTop: 0,
  stickyHeight: 0,
  trackHeight: 0,
  collapseDistance: 0,
  isReady: false,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function useRoutineStackLayout({
  cardCount,
  headerHeight,
  cardPeekHeight,
  cardFlowGap,
  ctaGap,
  resetKey,
}: UseRoutineStackLayoutParams) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const ctaRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [metrics, setMetrics] = useState<RoutineStackMetrics>(EMPTY_METRICS)
  const [progress, setProgress] = useState(0)

  const registerCardRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      cardRefs.current[index] = node
    },
    [],
  )

  const recomputeMetrics = useCallback(() => {
    if (cardCount === 0) {
      setMetrics(EMPTY_METRICS)
      return
    }

    const cardHeights = cardRefs.current
      .slice(0, cardCount)
      .map((card) => Math.round(card?.getBoundingClientRect().height ?? 0))
    const ctaHeight = Math.round(ctaRef.current?.getBoundingClientRect().height ?? 0)

    if (cardHeights.some((height) => height <= 0) || ctaHeight <= 0) {
      setMetrics((previous) => (previous.isReady ? { ...previous, isReady: false } : previous))
      return
    }

    const naturalTops: number[] = []
    const collapsedTops = Array.from({ length: cardCount }, (_, index) => index * cardPeekHeight)

    let accumulatedTop = 0
    for (let index = 0; index < cardCount; index += 1) {
      naturalTops.push(accumulatedTop)
      accumulatedTop += cardHeights[index] + (index < cardCount - 1 ? cardFlowGap : 0)
    }

    const naturalStackHeight = accumulatedTop
    const collapsedStackHeight = cardHeights.reduce(
      (maxHeight, cardHeight, index) => Math.max(maxHeight, collapsedTops[index] + cardHeight),
      0,
    )
    const naturalCtaTop = naturalStackHeight + ctaGap
    const collapsedCtaTop = collapsedStackHeight + ctaGap
    const stickyHeight = collapsedCtaTop + ctaHeight
    const trackHeight = naturalCtaTop + ctaHeight
    const collapseDistance = Math.max(trackHeight - stickyHeight, 0)

    setMetrics({
      cardHeights,
      naturalTops,
      collapsedTops,
      naturalCtaTop,
      collapsedCtaTop,
      stickyHeight,
      trackHeight,
      collapseDistance,
      isReady: true,
    })
  }, [cardCount, cardFlowGap, cardPeekHeight, ctaGap])

  useLayoutEffect(() => {
    let frameId = 0

    if (typeof window !== 'undefined') {
      frameId = window.requestAnimationFrame(() => {
        recomputeMetrics()
      })
    }

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        if (frameId !== 0) {
          window.cancelAnimationFrame(frameId)
        }
      }
    }

    const observer = new ResizeObserver(() => {
      recomputeMetrics()
    })

    cardRefs.current.slice(0, cardCount).forEach((card) => {
      if (card) {
        observer.observe(card)
      }
    })

    if (ctaRef.current) {
      observer.observe(ctaRef.current)
    }

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
      observer.disconnect()
    }
  }, [cardCount, recomputeMetrics, resetKey, metrics.isReady])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let frameId = 0

    const updateProgress = () => {
      frameId = 0

      const track = trackRef.current
      if (!track || !metrics.isReady) {
        setProgress(0)
        return
      }

      if (metrics.collapseDistance <= 0) {
        setProgress(1)
        return
      }

      const trackRect = track.getBoundingClientRect()
      const nextProgress = clamp((headerHeight - trackRect.top) / metrics.collapseDistance, 0, 1)

      setProgress((previous) => (Math.abs(previous - nextProgress) < 0.001 ? previous : nextProgress))
    }

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return
      }
      frameId = window.requestAnimationFrame(updateProgress)
    }

    scheduleUpdate()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [headerHeight, metrics.collapseDistance, metrics.isReady, resetKey])

  const cardOffsets = useMemo(
    () => metrics.naturalTops.map((naturalTop, index) => naturalTop - metrics.collapsedTops[index]),
    [metrics.collapsedTops, metrics.naturalTops],
  )
  const ctaOffset = metrics.naturalCtaTop - metrics.collapsedCtaTop
  const phase: StackPhase = progress >= 0.999 ? 'released' : 'stacking'

  return {
    trackRef,
    ctaRef,
    registerCardRef,
    metrics,
    progress,
    phase,
    cardOffsets,
    ctaOffset,
  }
}
