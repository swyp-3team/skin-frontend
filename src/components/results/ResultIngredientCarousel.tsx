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
  const [, setActiveIndex] = useState(initialActiveIndex)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  if (cardsToRender.length === 0) {
    return null
  }

  const emphasizedIndex = hoveredIndex ?? focusedIndex ?? flippedIndex

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
                  'group relative block h-[190px] w-[158px] cursor-default rounded-lg text-left transition-transform opacity-100 shadow-none transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isEmphasized
                    ? '-translate-y-3 duration-[450ms]'
                    : 'translate-y-0 duration-[500ms]',
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
                      'relative block h-full w-full rounded-lg [transform-style:preserve-3d] transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                    )}
                    style={useFlipMotion ? { transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' } : undefined}
                  >
                    <span
                      className={cn(
                        'absolute inset-0 inline-flex h-full flex-col items-start justify-start gap-1 rounded-[8px] bg-neutral-600 px-2 py-3 text-common-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] transition-opacity duration-2000 motion-reduce:transition-none',
                      )}
                      style={!useFlipMotion ? { opacity: isRevealed ? 0 : 1 } : undefined}
                    >
                      <span className="text-xs font-medium leading-[16.32px] text-neutral-200">{rankLabel}</span>
                      <span className="w-full break-words text-base font-semibold leading-[23.68px] text-common-0">
                        {card.name}
                      </span>
                    </span>

                    <span
                      className={cn(
                        'absolute inset-0 inline-flex h-full flex-col items-start justify-between rounded-[8px] bg-primary-300 p-3 text-neutral-800 transition-opacity duration-3000 ease-[cubic-bezier(0.4,1,0.56,1)] motion-reduce:transition-none',
                        useFlipMotion
                          ? '[transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]'
                          : '',
                      )}
                      style={!useFlipMotion ? { opacity: isRevealed ? 1 : 0 } : undefined}
                    >
                      <span className="w-full break-words text-base font-semibold leading-[23.68px] text-neutral-800">
                        {card.name}
                      </span>
                      <span className="w-full break-words text-[10px] font-normal leading-[14px] text-neutral-800">
                        {card.description}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </SwiperSlide>
          )
        })}
      </Swiper>


    </div>
  )
}

export default ResultIngredientCarousel
