import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import AlertMessage from '../components/common/AlertMessage'
import MockLoginButton from '../components/common/MockLoginButton'
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
    <div className="h-[34px] inline-flex items-center gap-2 rounded-[20px] px-[5px] py-[5px] outline outline-1 -outline-offset-1 outline-neutral-200">
      <span className="rounded-[20px] bg-primary-100 px-3 py-1 text-[12px] font-medium leading-[16.32px] text-primary-500">
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

function LandingPage() {
  const location = useLocation()
  const authRedirectState = isAuthRedirectState(location.state) ? location.state : null
  const hasAuthRedirect = authRedirectState !== null

  return (
    <MobilePage className="bg-[#F2FAFA]" header={<PageHeader showLogo tone="light" />} mainClassName="px-0">
      <div className="flex flex-col pb-16">
        <section className="px-5 pb-[90px] pt-[60px]">
          <div className="inline-flex items-center rounded-[4px] bg-primary-50 px-2 py-1">
            <span className="text-[12px] font-medium leading-[16.32px] text-primary-500">{HOME_CONTENT.hero.badge}</span>
          </div>

          <h1 className="mt-[13px] flex flex-col gap-[5px]">
            <span className="block text-[24px] font-bold leading-[32.4px] text-neutral-800">피부 고민을 입력하면</span>
            <span className="block text-[24px] font-bold leading-[32.4px] text-primary-400">나에게 맞는</span>
            <span className="block text-[24px] font-bold leading-[32.4px] text-neutral-800">성분과 루틴을 알려드려요</span>
          </h1>

          <p className="mt-[19px] whitespace-pre-line text-[15px] leading-[22.2px] text-neutral-600">
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
              'mx-auto mt-[100px] flex h-12 w-[280px] rounded-full px-6 py-3 text-center text-base font-medium',
            )}
            to={APP_ROUTES.surveySteps}
          >
            {HOME_CONTENT.hero.primaryCta}
          </Link>

          <MockLoginButton className="mt-3" />
        </section>

        <section className="flex flex-col gap-10 px-5 pb-20">
          <div>
            <div className="inline-flex py-2">
              <span className="text-[13px] font-bold leading-[18.2px] text-primary-400">{HOME_CONTENT.howItWorks.eyebrow}</span>
            </div>
            <div className="space-y-1">
              {HOME_CONTENT.howItWorks.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  {line}
                </h2>
              ))}
            </div>
          </div>

          {HOME_CONTENT.howItWorks.steps.map((step) => (
            <article key={step.order} className="space-y-2">
              <p className="text-[24px] font-bold leading-[32.4px] text-neutral-200">{step.order}</p>
              <h3 className="text-[18px] font-bold leading-[25.56px] text-neutral-800">{step.title}</h3>
              <p className="whitespace-pre-line text-[13px] leading-[18.2px] text-neutral-600">{step.description}</p>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-10 bg-neutral-800 px-5 pt-10 pb-7 text-neutral-0">
          <div className="flex flex-col gap-2">
            <div className="inline-flex py-2">
              <span className="text-[13px] font-bold leading-[18.2px] text-primary-400">{HOME_CONTENT.ingredientEngine.eyebrow}</span>
            </div>
            <div className="space-y-1">
              {HOME_CONTENT.ingredientEngine.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-0">
                  {line}
                </h2>
              ))}
            </div>
            <div className="py-2">
              <p className="text-[15px] leading-[22.2px] text-neutral-100">{HOME_CONTENT.ingredientEngine.description}</p>
            </div>
          </div>

          <div className="-mx-5 overflow-hidden">
            <div className="-ml-[100px] w-[507px] space-y-[8px] px-0">
              {INGREDIENT_MARQUEE_ROWS.map((row, index) => (
                <IngredientMarqueeRow
                  key={`ingredient-row-${index}`}
                  durationSec={MARQUEE_DURATIONS[index] ?? 32}
                  items={row}
                  reverse={index % 2 === 1}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-10 bg-primary-50 px-5 py-13">
          <div className="flex flex-col gap-2">
            <div className="inline-flex py-2">
              <span className="text-[13px] font-bold leading-[18.2px] text-primary-400">{HOME_CONTENT.resultPreview.eyebrow}</span>
            </div>
            <div className="space-y-1">
              {HOME_CONTENT.resultPreview.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  {line}
                </h2>
              ))}
            </div>
            <div className="pt-2">
              <p className="text-[15px] leading-[22.2px] text-neutral-500">{HOME_CONTENT.resultPreview.description}</p>
            </div>
          </div>

          <Link
            className={cn(
              buttonVariants({ variant: 'dark' }),
              'inline-flex h-12 min-w-[170px] w-fit rounded-full px-8 py-3 text-center text-base font-[500px]',
            )}
            to={APP_ROUTES.survey}
          >
            {HOME_CONTENT.resultPreview.cta}
          </Link>
        </section>

        <section className="px-5 pt-30 pb-25">
          <div className="mx-auto flex flex-col items-center gap-2 text-center">
            <div className="space-y-1">
              {HOME_CONTENT.finalCta.titleLines.map((line) => (
                <h2 key={line} className="text-[24px] font-bold leading-[32.4px] text-neutral-800">
                  {line}
                </h2>
              ))}
            </div>
            <div className="py-2">
              <p className="text-[15px] leading-[22.2px] text-neutral-500">{HOME_CONTENT.finalCta.description}</p>
            </div>
          </div>

          <Link
            className={cn(
              buttonVariants({ variant: 'dark' }),
              'mx-auto mt-[43px] flex h-12 w-[280px] items-center justify-center rounded-full px-6 py-3 text-center text-base font-medium',
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

export default LandingPage
