import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import SafeImage from '../common/SafeImage'
import type { ResultOverviewViewModel } from './resultOverviewViewModel'

interface ResultOverviewScreenProps {
  mode: 'preview' | 'full'
  viewModel: ResultOverviewViewModel
  onRoutineCtaClick: () => void
  onProductsCtaClick: () => void
  onPreviewLoginClick?: () => void
}

const ROUTINE_HIGHLIGHT_STYLE_CLASS = [
  'left-2 top-11 h-[140px] w-[160px] bg-primary-100/80 text-primary-500 text-[15px] leading-[22.2px]',
  'left-[130px] top-3 h-[108px] w-[132px] bg-[#FCDDD1]/80 text-[#E8856A] text-sm leading-[20.44px]',
  'left-[198px] top-[82px] h-[121px] w-[110px] bg-[#FDEECE]/80 text-[#E8A730] text-[13px] leading-[18.2px]',
] as const

function PreviewBlurOverlay({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 rounded-t-2xl">
      <div className="absolute inset-0 rounded-t-2xl bg-common-0/60 backdrop-blur-[4px]" />

      <div className="pointer-events-auto absolute inset-x-4 top-20">
        <Button
          className="h-auto w-full rounded-full border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold text-neutral-600"
          onClick={onLoginClick}
          type="button"
          variant="outline"
        >
          로그인하고 전체 결과보기
        </Button>
      </div>

      <div className="pointer-events-auto absolute inset-x-4 bottom-6">
        <Button
          className="h-auto w-full rounded-full border border-neutral-100 bg-common-0 px-6 py-3 text-base font-semibold text-neutral-600"
          onClick={onLoginClick}
          type="button"
          variant="outline"
        >
          로그인하고 전체 결과보기
        </Button>
      </div>
    </div>
  )
}

function ResultOverviewScreen({
  mode,
  viewModel,
  onRoutineCtaClick,
  onProductsCtaClick,
  onPreviewLoginClick,
}: ResultOverviewScreenProps) {
  const isPreview = mode === 'preview'

  return (
    <section className="relative w-full overflow-hidden bg-neutral-800">
      <section className="px-7 pb-10 pt-8 text-common-0">
        <div className="flex flex-col items-center gap-3 text-center">
          {viewModel.top.diagnosedDate ? (
            <span className="inline-flex items-center rounded-full bg-neutral-600 px-2 py-1 text-[11px] leading-[14.3px] text-neutral-200">
              {viewModel.top.diagnosedDate}
            </span>
          ) : null}

          <h1 className="text-2xl font-bold leading-[32.4px] text-primary-300">{viewModel.top.title}</h1>

          <SafeImage
            alt={viewModel.top.title}
            className="h-[168px] w-[137px] rounded-[20px] object-cover"
            fallbackAlt={`${viewModel.top.title} 대표 이미지`}
            src={viewModel.top.imageUrl}
          />

          <p className="w-full text-[15px] leading-[22.2px] text-common-0">{viewModel.top.summary}</p>
        </div>
      </section>

      <div className="h-16 bg-gradient-to-b from-neutral-800 via-neutral-800/70 to-transparent" />

      <section className="relative -mt-6 rounded-t-2xl bg-common-0 px-4 pb-12 pt-6 text-neutral-800">
        <div className="space-y-10">
          <section className="space-y-6">
            <h2 className="whitespace-pre-line text-[20px] font-bold leading-[27.6px] text-neutral-800">
              {viewModel.routine.sectionTitle}
            </h2>

            <div className="relative h-[218px]">
              {viewModel.routine.highlights.slice(0, 3).map((highlight, index) => (
                <div
                  className={cn(
                    'absolute inline-flex items-center justify-center rounded-full px-5 text-center font-medium',
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
              onClick={onRoutineCtaClick}
              type="button"
              variant="dark"
            >
              {viewModel.routine.ctaLabel}
            </Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-[20px] font-bold leading-[27.6px] text-neutral-800">{viewModel.ingredients.sectionTitle}</h2>

            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex min-w-max gap-2 pb-1">
                {viewModel.ingredients.cards.slice(0, 3).map((card) => (
                  <article
                    className={cn(
                      'w-[149px] rounded-lg p-3',
                      card.isPrimary ? 'bg-primary-300 text-neutral-800' : 'bg-neutral-600 text-common-0',
                    )}
                    key={`${card.rank}-${card.name}`}
                  >
                    <p
                      className={cn(
                        'text-xs font-medium leading-[16.32px]',
                        card.isPrimary ? 'text-neutral-700' : 'text-neutral-200',
                      )}
                    >
                      {String(card.rank).padStart(2, '0')}
                    </p>
                    <p className="mt-1 text-base font-semibold leading-[23.68px]">{card.name}</p>
                    <p
                      className={cn(
                        'mt-4 text-[11px] leading-[15.4px]',
                        card.isPrimary ? 'text-neutral-700' : 'text-neutral-100',
                      )}
                    >
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <Button
              className="h-auto w-full rounded-lg px-5 py-2.5 text-[15px] font-medium leading-[22.2px]"
              onClick={onProductsCtaClick}
              type="button"
              variant="dark"
            >
              {viewModel.ingredients.ctaLabel}
            </Button>
          </section>
        </div>

        {isPreview ? <PreviewBlurOverlay onLoginClick={onPreviewLoginClick ?? onProductsCtaClick} /> : null}
      </section>
    </section>
  )
}

export default ResultOverviewScreen
