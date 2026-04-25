import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import PageHeader from '../components/common/PageHeader'
import MobilePage from '../components/MobilePage'
import { buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT, isAuthRedirectState } from '../constants/auth'
import { cn } from '../lib/utils'
import { HOME_CONTENT, type IngredientChipItem, INGREDIENT_MARQUEE_ROWS } from './home/homeContent'
import './home/homepage.css'

const MARQUEE_DURATIONS = [34, 30, 36] as const

interface IngredientChipProps {
  item: IngredientChipItem
}

function IngredientChip({ item }: IngredientChipProps) {
  return (
    <div className="h-[40px] inline-flex items-center gap-2 rounded-full px-[5px] py-[5px] outline outline-1 -outline-offset-1 outline-neutral-200">
      <span className="rounded-full bg-primary-100 px-3 py-1 text-[12px] font-medium leading-[16.32px] text-primary-500">
        {item.category}
      </span>
      <span className="pr-2 text-[13px] font-medium leading-[18.2px] text-neutral-50">{item.ingredient}</span>
    </div>
  )
}

interface IngredientMarqueeRowProps {
  items: readonly IngredientChipItem[]
  reverse?: boolean
  durationSec: number
}

function IngredientMarqueeRow({ items, reverse = false, durationSec }: IngredientMarqueeRowProps) {
  const style = { '--marquee-duration': `${durationSec}s` } as CSSProperties
  const duplicatedItems = [...items, ...items]

  return (
    <div className="homepage-marquee-row">
      <div className={cn('homepage-marquee-track', reverse && 'homepage-marquee-track--reverse')} style={style}>
        {duplicatedItems.map((item, index) => (
          <IngredientChip key={`${item.category}-${item.ingredient}-${index}`} item={item} />
        ))}
      </div>
    </div>
  )
}

function HomePage() {
  const location = useLocation()
  const authRedirectState = isAuthRedirectState(location.state) ? location.state : null
  const hasAuthRedirect = authRedirectState !== null


  return (
    <MobilePage className="bg-[#F2FAFA]" header={<PageHeader showLogo tone="light" />} mainClassName="px-0">
      <div className="flex flex-col pb-16">
        <section className="px-5 pb-14 pt-18">
          <div className="inline-flex items-center rounded-[4px] bg-primary-50 px-2 py-1">
            <span className="text-[12px] font-medium leading-[16.32px] text-primary-500">{HOME_CONTENT.hero.badge}</span>
          </div>

          <h1 className="mt-5 flex flex-col gap-[5px]">
            <span className="block text-[24px] font-bold leading-[32.4px] text-neutral-800">피부 고민을 입력하면</span>
            <span className="block text-[24px] font-bold leading-[32.4px] text-primary-400">나에게 맞는</span>
            <span className="block text-[24px] font-bold leading-[32.4px] text-neutral-800">성분과 루틴을 알려드려요</span>
          </h1>

          <p className="mt-5 whitespace-pre-line text-[15px] leading-[22.2px] text-neutral-600">
            {HOME_CONTENT.hero.description}
          </p>

          {hasAuthRedirect ? (
            <AlertMessage className="mt-6" size="md" variant="warning">
              {authRedirectState?.from ?? AUTH_UI_TEXT.protectedPageFallback}
              {AUTH_UI_TEXT.protectedPageHintSuffix}
            </AlertMessage>
          ) : null}

          <Link
            className={cn(
              buttonVariants({ variant: 'dark' }),
              'mt-8 h-12 w-full rounded-full px-6 py-3 text-center text-base font-medium shadow-[var(--shadow-cta)]',
            )}
            to={APP_ROUTES.surveySteps}
          >
            {HOME_CONTENT.hero.primaryCta}
          </Link>

        </section>

        <section className="space-y-10 px-5 py-10">
          <div>
            <span className="text-[13px] font-bold leading-[18.2px] text-primary-400">{HOME_CONTENT.howItWorks.eyebrow}</span>
            <div className="mt-2 space-y-1">
              {HOME_CONTENT.howItWorks.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  {line}
                </h2>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {HOME_CONTENT.howItWorks.steps.map((step) => (
              <article key={step.order} className="space-y-2">
                <p className="text-[24px] font-bold leading-[32.4px] text-neutral-200">{step.order}</p>
                <h3 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">{step.title}</h3>
                <p className="whitespace-pre-line text-[13px] leading-[18.2px] text-neutral-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-13 bg-neutral-800 px-0 py-10 text-neutral-0">
          <div className="space-y-4 px-5">
            <span className="text-[13px] font-bold leading-[18.2px] text-primary-400">{HOME_CONTENT.ingredientEngine.eyebrow}</span>
            <div className="space-y-1">
              {HOME_CONTENT.ingredientEngine.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-0">
                  {line}
                </h2>
              ))}
            </div>
            <p className="text-[15px] leading-[22.2px] text-neutral-100">{HOME_CONTENT.ingredientEngine.description}</p>
          </div>

          <div className="w-full space-y-4">
            {INGREDIENT_MARQUEE_ROWS.map((row, index) => (
              <IngredientMarqueeRow
                key={`ingredient-row-${index}`}
                durationSec={MARQUEE_DURATIONS[index] ?? 32}
                items={row}
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </section>

        <section className="space-y-10 bg-primary-50 px-5 py-10">
          <div className="space-y-4">
            <span className="text-[13px] font-bold leading-[18.2px] text-primary-400">{HOME_CONTENT.resultPreview.eyebrow}</span>
            <div className="space-y-1">
              {HOME_CONTENT.resultPreview.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  {line}
                </h2>
              ))}
            </div>
            <p className="text-[15px] leading-[22.2px] text-neutral-500">{HOME_CONTENT.resultPreview.description}</p>
          </div>

          <Link
            className={cn(
              buttonVariants({ variant: 'dark' }),
              'inline-flex h-12 min-w-[170px] rounded-full px-6 py-3 text-center text-base font-medium',
            )}
            to={APP_ROUTES.survey}
          >
            {HOME_CONTENT.resultPreview.cta}
          </Link>
        </section>

        <section className="px-5 py-12">
          <div className="mx-auto flex max-w-[390px] flex-col items-center gap-3 text-center">
            <div className="space-y-1">
              {HOME_CONTENT.finalCta.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  {line}
                </h2>
              ))}
            </div>
            <p className="text-[15px] leading-[22.2px] text-neutral-500">{HOME_CONTENT.finalCta.description}</p>
          </div>

          <Link
            className={cn(
              buttonVariants({ variant: 'dark' }),
              'mx-auto mt-8 flex h-12 w-full max-w-[295px] items-center justify-center rounded-full px-6 py-3 text-center text-base font-medium',
            )}
            to={APP_ROUTES.survey}
          >
            {HOME_CONTENT.finalCta.cta}
          </Link>
        </section>
      </div>
    </MobilePage>
  )
}

export default HomePage
