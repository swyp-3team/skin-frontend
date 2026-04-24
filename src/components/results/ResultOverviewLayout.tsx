import type { ReactNode } from 'react'

import MobilePage from '@/components/MobilePage'
import PageHeader from '@/components/common/PageHeader'
import SafeImage from '@/components/common/SafeImage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ResultOverviewViewModel } from './resultOverviewViewModel'

const ROUTINE_HIGHLIGHT_STYLE_CLASS = [
  'left-2 top-11 h-[140px] w-[160px] bg-[#9ADEDA]/40 text-primary-500 text-[15px] leading-[22.2px]',
  'left-[130px] top-3 h-[108px] w-[132px] bg-[#FCDDD1]/40 text-orange-400 text-sm leading-[20.44px]',
  'left-[198px] top-[82px] h-[121px] w-[110px] bg-[#FDEECE]/40 text-yellow-400 text-[13px] leading-[18.2px]',
] as const

interface ResultOverviewLayoutProps {
  viewModel: ResultOverviewViewModel
  onRoutineCta: () => void
  onProductsCta: () => void
  cardOverlay?: ReactNode
}

function ResultOverviewLayout({ viewModel, onRoutineCta, onProductsCta, cardOverlay }: ResultOverviewLayoutProps) {
  return (
    <MobilePage
      className="bg-neutral-800"
      header={<PageHeader hideTitle title="진단 결과" tone="dark" />}
      mainClassName="overflow-x-hidden p-0"
    >
      <section className="relative w-full overflow-hidden bg-common-0">
        {/* 상단 다크 영역 */}
        <section className="bg-neutral-800 px-7 pb-10 pt-[32px] text-common-0">
          <div className="flex flex-col items-center gap-3 text-center">
            {viewModel.top.diagnosedDate ? (
              <span className="inline-flex items-center rounded-full bg-neutral-600 px-2 py-1 text-[11px] leading-[14.3px] text-neutral-200">
                {viewModel.top.diagnosedDate}
              </span>
            ) : null}

            <h1 className="px-5 text-2xl font-bold leading-[32.4px] text-primary-300">{viewModel.top.title}</h1>

            <SafeImage
              alt={viewModel.top.title}
              className="h-[168px] w-[137px] rounded-[20px] object-cover"
              fallbackAlt={`${viewModel.top.title} 대표 이미지`}
              src={viewModel.top.imageUrl}
            />

            <p className="w-full px-5 text-[15px] leading-[22.2px] text-common-0">{viewModel.top.summary}</p>
          </div>
        </section>

        <div className="h-[246px] bg-gradient-to-b from-neutral-800 via-neutral-800/70 to-transparent" />

        {/* 화이트 카드 영역 */}
        <section className="relative -mt-[246px] mx-3 rounded-t-2xl bg-common-0 px-4 pb-30 pt-6 text-neutral-800">
          <div className="space-y-25">
            {/* 루틴 섹션 */}
            <section className="space-y-6">
              <div className="pb-3 text-[20px] font-bold leading-[27.6px] tracking-[-0.02em] text-neutral-800">
                <div>지금 피부에</div>
                <div className="relative w-fit">
                  <span className="relative inline-block">
                    <span aria-hidden className="absolute inset-x-0 bottom-0.5 h-4 bg-primary-100" />
                    <span className="relative z-10">필요한 스킨케어 루틴</span>
                  </span>
                  <span className="relative z-10">은?</span>
                </div>
              </div>

              <div className="relative left-1 h-[218px]">
                {viewModel.routine.highlights.slice(0, 3).map((highlight, index) => (
                  <div
                    className={cn(
                      'absolute inline-flex items-center justify-center rounded-full text-center font-medium',
                      ROUTINE_HIGHLIGHT_STYLE_CLASS[index] ?? ROUTINE_HIGHLIGHT_STYLE_CLASS[0],
                    )}
                    key={`${highlight}-${index}`}
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-sm leading-[20.44px] text-neutral-800">{viewModel.routine.highlightDescription}</p>
              </div>

              <Button
                className="h-auto w-full rounded-lg px-5 py-2.5 text-[15px] font-medium leading-[22.2px]"
                onClick={onRoutineCta}
                type="button"
                variant="dark"
              >
                {viewModel.routine.ctaLabel}
              </Button>
            </section>

            {/* 성분 섹션 */}
            <section className="space-y-10">
              <div className="text-[20px] font-bold leading-[27.6px] tracking-[-0.02em] text-neutral-800">
                <div className="inline-flex items-end">
                  <div className="relative w-fit">
                    <div aria-hidden className="absolute inset-x-0 bottom-0.5 h-4 bg-primary-100" />
                    <div className="relative z-10">사용하면 좋은 성분</div>
                  </div>
                  <div>이에요</div>
                </div>
              </div>

              <div className="-mx-4 overflow-x-auto px-4">
                <div className="flex min-w-max gap-2 pb-1">
                  {viewModel.ingredients.cards.slice(0, 3).map((card) => (
                    <article
                      className={cn(
                        'h-[170px] w-[149px] rounded-lg',
                        card.isPrimary
                          ? 'flex flex-col justify-between bg-primary-300 p-3 text-neutral-800'
                          : 'flex flex-col gap-1 bg-neutral-600 px-2 py-3 text-common-0',
                      )}
                      key={`${card.rank}-${card.name}`}
                    >
                      {card.isPrimary ? (
                        <>
                          <p className="text-base font-semibold leading-[23.68px]">{card.name}</p>
                          <p className="text-[10px] leading-[14px] text-neutral-700">{card.description}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium leading-[16.32px] text-neutral-200">
                            {String(card.rank).padStart(2, '0')}
                          </p>
                          <p className="text-base font-semibold leading-[23.68px]">{card.name}</p>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              <Button
                className="h-auto w-full rounded-lg px-5 py-2.5 text-[15px] font-medium leading-[22.2px]"
                onClick={onProductsCta}
                type="button"
                variant="dark"
              >
                {viewModel.ingredients.ctaLabel}
              </Button>
            </section>
          </div>

          {cardOverlay}
        </section>
      </section>
    </MobilePage>
  )
}

export default ResultOverviewLayout
