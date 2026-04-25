import { useEffect, useId, useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { cn } from '@/lib/utils'

import type { ResultOverviewIngredientCardViewModel } from './resultOverviewViewModel'

import 'swiper/css'
import 'swiper/css/pagination'

const HOVER_MEDIA_QUERY = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

interface ResultIngredientCarouselProps {
  cards: ResultOverviewIngredientCardViewModel[]
}

function readMediaQuery(query: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(query).matches
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => readMediaQuery(query))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const updateMatches = () => setMatches(mediaQueryList.matches)

    updateMatches()

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', updateMatches)

      return () => {
        mediaQueryList.removeEventListener('change', updateMatches)
      }
    }

    mediaQueryList.addListener(updateMatches)

    return () => {
      mediaQueryList.removeListener(updateMatches)
    }
  }, [query])

  return matches
}

function findInitialActiveIndex(cards: ResultOverviewIngredientCardViewModel[]) {
  const primaryIndex = cards.findIndex((card) => card.isPrimary)
  return primaryIndex >= 0 ? primaryIndex : 0
}

function toRankLabel(rank: number) {
  return String(rank).padStart(2, '0')
}

function ResultIngredientCarousel({ cards }: ResultIngredientCarouselProps) {
  const cardsToRender = cards.slice(0, 3)
  const initialActiveIndex = findInitialActiveIndex(cardsToRender)
  const rawId = useId()
  const paginationClassName = `result-ingredient-carousel-pagination-${rawId.replace(/[:]/g, '')}`
  const swiperRef = useRef<SwiperInstance | null>(null)
  const supportsHover = useMediaQuery(HOVER_MEDIA_QUERY)
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_MEDIA_QUERY)
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  if (cardsToRender.length === 0) {
    return null
  }

  const emphasizedIndex = hoveredIndex ?? focusedIndex ?? activeIndex

  function handleCardClick(index: number) {
    swiperRef.current?.slideTo(index)
    setActiveIndex(index)

    if (supportsHover) {
      return
    }

    setFlippedIndex((currentIndex) => (currentIndex === index ? null : index))
  }

  function handleSlideChange(swiper: SwiperInstance) {
    setActiveIndex(swiper.activeIndex)

    if (!supportsHover) {
      setFlippedIndex(null)
    }
  }

  function handleCardMouseEnter(index: number) {
    if (!supportsHover) {
      return
    }

    setHoveredIndex(index)
  }

  function handleCardMouseLeave() {
    if (!supportsHover) {
      return
    }

    setHoveredIndex(null)
  }

  function handleCardFocus(index: number) {
    setFocusedIndex(index)
  }

  function handleCardBlur(index: number) {
    setFocusedIndex((currentIndex) => (currentIndex === index ? null : currentIndex))
  }

  return (
    <div className="-mx-4 px-4">
      <Swiper
        a11y={{
          enabled: true,
          paginationBulletMessage: '{{index}}번 성분 카드로 이동',
          slideLabelMessage: '{{index}} / {{slidesLength}}',
        }}
        className="!overflow-visible"
        initialSlide={initialActiveIndex}
        modules={[Pagination, A11y]}
        onActiveIndexChange={handleSlideChange}
        onSliderFirstMove={() => {
          if (!supportsHover) {
            setFlippedIndex(null)
          }
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        pagination={{
          clickable: true,
          el: `.${paginationClassName}`,
        }}
        slidesPerView="auto"
        spaceBetween={8}
      >
        {cardsToRender.map((card, index) => {
          const isEmphasized = emphasizedIndex === index
          const isRevealed = supportsHover
            ? hoveredIndex === index || focusedIndex === index
            : flippedIndex === index || focusedIndex === index
          const useFlipMotion = !prefersReducedMotion
          const rankLabel = toRankLabel(card.rank)

          return (
            <SwiperSlide className="!w-[158px]" key={`${card.rank}-${card.name}`}>
              <button
                aria-label={`${rankLabel} ${card.name}`}
                aria-pressed={!supportsHover ? flippedIndex === index : undefined}
                className={cn(
                  'group relative block h-[170px] w-[158px] rounded-lg text-left transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-common-0',
                  isEmphasized
                    ? '-translate-y-1.5 opacity-100 shadow-[0_18px_28px_rgba(13,15,12,0.18)]'
                    : 'translate-y-0 scale-[0.96] opacity-45 shadow-none',
                )}
                onBlur={() => handleCardBlur(index)}
                onClick={() => handleCardClick(index)}
                onFocus={() => handleCardFocus(index)}
                onMouseEnter={() => handleCardMouseEnter(index)}
                onMouseLeave={handleCardMouseLeave}
                type="button"
              >
                <span className="block h-full w-full [perspective:1200px]">
                  <span
                    className={cn(
                      'relative block h-full w-full rounded-lg [transform-style:preserve-3d] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                    )}
                    style={useFlipMotion ? { transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' } : undefined}
                  >
                    <span
                      className={cn(
                        'absolute inset-0 flex h-full flex-col justify-between rounded-lg border border-neutral-700/80 bg-neutral-800 px-3 py-3 text-common-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] transition-opacity duration-150 motion-reduce:transition-none',
                      )}
                      style={!useFlipMotion ? { opacity: isRevealed ? 0 : 1 } : undefined}
                    >
                      <span className="text-xs font-medium leading-[16.32px] text-neutral-300">{rankLabel}</span>
                      <span className="line-clamp-2 pr-8 text-base font-semibold leading-[23.68px]">{card.name}</span>
                    </span>

                    <span
                      className={cn(
                        'absolute inset-0 flex h-full flex-col rounded-lg bg-primary-300 px-3 py-3 text-neutral-800 transition-opacity duration-150 motion-reduce:transition-none',
                        useFlipMotion
                          ? '[transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]'
                          : '',
                      )}
                      style={!useFlipMotion ? { opacity: isRevealed ? 1 : 0 } : undefined}
                    >
                      <span className="text-xs font-medium leading-[16.32px] text-neutral-700">{rankLabel}</span>
                      <span className="mt-1 line-clamp-2 text-base font-semibold leading-[23.68px]">{card.name}</span>
                      <span className="mt-3 line-clamp-5 text-[10px] leading-[14px] text-neutral-700">{card.description}</span>
                    </span>
                  </span>
                </span>
              </button>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <div
        className={cn(
          paginationClassName,
          'mt-5 flex items-center justify-center gap-2 [&_.swiper-pagination-bullet]:m-0 [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-neutral-200 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet-active]:bg-neutral-800',
        )}
      />
    </div>
  )
}

export default ResultIngredientCarousel
