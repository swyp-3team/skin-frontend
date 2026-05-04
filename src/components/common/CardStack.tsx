import { motion } from 'motion/react'
import React, { useRef, useState } from 'react'

import { cn } from '../../lib/utils'

const PRODUCT_OVERLAP_HEIGHT = 95
const EXPANDED_CARD_GAP = 20

const DRAG_THRESHOLD = 10
const SWIPE_VELOCITY_THRESHOLD = 500
const SNAP_DISTANCE = EXPANDED_CARD_GAP + PRODUCT_OVERLAP_HEIGHT
const COLLAPSED_MARGIN = -PRODUCT_OVERLAP_HEIGHT

const SPRING = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as const

interface CardStackProps {
  children: React.ReactNode
  className?: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function CardStack({ children, className }: CardStackProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const suppressClickRef = useRef(false)
  const cards = React.Children.toArray(children)

  if (cards.length <= 1) {
    return <div className={className}>{children}</div>
  }

  const getDragProgress = (offsetY: number) => {
    const baseProgress = isExpanded ? 0 : 1
    return clamp(baseProgress - offsetY / SNAP_DISTANCE, 0, 1)
  }

  const progress = isDragging ? getDragProgress(dragOffsetY) : isExpanded ? 0 : 1

  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('a, button')) return
    if (suppressClickRef.current) return
    setIsExpanded((prev) => !prev)
  }

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ touchAction: 'pan-x' }}
      onPanStart={() => {
        setIsDragging(true)
        setDragOffsetY(0)
        suppressClickRef.current = false
      }}
      onPan={(_, info) => {
        setDragOffsetY(info.offset.y)
        if (Math.abs(info.offset.y) > DRAG_THRESHOLD) suppressClickRef.current = true
      }}
      onPanEnd={(_, info) => {
        const progressAtRelease = getDragProgress(info.offset.y)
        const velocityY = info.velocity.y

        if (velocityY <= -SWIPE_VELOCITY_THRESHOLD) setIsExpanded(false)
        else if (velocityY >= SWIPE_VELOCITY_THRESHOLD) setIsExpanded(true)
        else setIsExpanded(progressAtRelease < 0.5)

        setIsDragging(false)
        setDragOffsetY(0)

        if (suppressClickRef.current) {
          setTimeout(() => {
            suppressClickRef.current = false
          }, 0)
        }
      }}
    >
      {cards.map((card, index) => {
        const isLast = index === cards.length - 1
        const targetMargin = isLast ? EXPANDED_CARD_GAP : lerp(EXPANDED_CARD_GAP, COLLAPSED_MARGIN, progress)

        return (
          <motion.div
            key={index}
            animate={{ marginBottom: targetMargin }}
            initial={{ marginBottom: targetMargin }}
            style={{ position: 'relative', zIndex: index + 1 }}
            transition={isDragging ? { duration: 0 } : SPRING}
            onClick={handleClick}
            className="cursor-pointer"
          >
            {card}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default CardStack
