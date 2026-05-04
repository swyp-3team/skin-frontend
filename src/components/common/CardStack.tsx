import { motion } from 'motion/react'
import React, { useState } from 'react'

import { cn } from '../../lib/utils'

const PRODUCT_OVERLAP_HEIGHT = 95
const EXPANDED_CARD_GAP = 20
const COLLAPSED_MARGIN = -PRODUCT_OVERLAP_HEIGHT

const SPRING = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as const

interface CardStackProps {
  children: React.ReactNode
  className?: string
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function CardStack({ children, className }: CardStackProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const cards = React.Children.toArray(children)

  if (cards.length <= 1) {
    return <div className={className}>{children}</div>
  }

  const progress = isExpanded ? 0 : 1

  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('a, button')) return
    setIsExpanded((prev) => !prev)
  }

  return (
    <motion.div className={cn('relative', className)}>
      {cards.map((card, index) => {
        const isLast = index === cards.length - 1
        const targetMargin = isLast ? EXPANDED_CARD_GAP : lerp(EXPANDED_CARD_GAP, COLLAPSED_MARGIN, progress)

        return (
          <motion.div
            key={index}
            animate={{ marginBottom: targetMargin }}
            initial={{ marginBottom: targetMargin }}
            style={{ position: 'relative', zIndex: index + 1 }}
            transition={SPRING}
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
