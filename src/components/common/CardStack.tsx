import { motion } from 'motion/react'
import React, { useState } from 'react'

import { cn } from '../../lib/utils'

// RoutineStepCard 기준:
// 제품 영역 높이 = gap-[15px] + 제품행(h-20=80px) + p-3 하단패딩(12px) = 107px
const PRODUCT_OVERLAP_HEIGHT = 95

// 드래그로 접기/펼치기를 트리거할 최소 이동 거리(px)
const DRAG_THRESHOLD = 10

const SPRING = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 } as const

interface CardStackProps {
  children: React.ReactNode
  className?: string
}

function CardStack({ children, className }: CardStackProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const cards = React.Children.toArray(children)

  if (cards.length <= 1) {
    return <div className={className}>{children}</div>
  }

  function handleClick(e: React.MouseEvent) {
    // 링크/버튼 클릭은 기본 동작에 맡김
    if ((e.target as HTMLElement).closest('a, button')) return
    setIsExpanded((prev) => !prev)
  }

  return (
    <motion.div
      className={cn('relative', className)}
      // onPan은 스크롤을 방해하지 않고 제스처만 감지
      onPanEnd={(_, info) => {
        if (!isExpanded && info.offset.y > DRAG_THRESHOLD) setIsExpanded(true)
        if (isExpanded && info.offset.y < -DRAG_THRESHOLD) setIsExpanded(false)
      }}
    >
      {cards.map((card, index) => {
        const isLast = index === cards.length - 1
        const targetMargin = !isExpanded && !isLast ? -PRODUCT_OVERLAP_HEIGHT : 20

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
