import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { APP_ROUTES } from '../app/routes'
import routineConnectorLine from '../assets/icons/landing/vector-104.svg'
import heroScrollArrow from '../assets/icons/landing/vector-88.svg'
import AlertMessage from '../components/common/AlertMessage'
import MockLoginButton from '../components/common/MockLoginButton'
import PageHeader from '../components/headers/PageHeader'
import MobilePage from '../components/MobilePage'
import { buttonVariants } from '../components/ui/button'
import { AUTH_UI_TEXT, isAuthRedirectState } from '../constants/auth'
import { useHeroParallax } from '../hooks/useHeroParallax'
import { useLandingStepReveal } from '../hooks/useLandingStepReveal'
import { cn } from '../lib/utils'
import './landing.css'

const CHAT_BUBBLES = [
  {
    text: '새로운 화장품 사용으로 따갑거나 붉어진 경험이 있나요?',
    className:
      'absolute left-3 top-5 w-[184px] rounded-[12px_12px_12px_2px] bg-neutral-600',
  },
  {
    text: '오후가 되면 피부가 번들거리나요?',
    className:
      'absolute left-[165px] top-[82px] max-w-[161px] rounded-[12px_12px_2px_12px] bg-neutral-500 [animation-delay:0.3s]',
  },
  {
    text: '세안 후 아무것도 바르지 않은 상태로 5분쯤 지나면, 얼굴이 당기는 느낌이 드나요?',
    className:
      'absolute left-3 top-[129px] w-[232px] rounded-[12px_12px_12px_2px] bg-neutral-600 [animation-delay:0.6s]',
  },
  {
    text: '지금 가장 먼저 해결하고 싶은 피부 고민은 무엇인가요?',
    className:
      'absolute left-[135px] top-[193px] w-[188px] rounded-[12px_12px_2px_12px] bg-neutral-500 [animation-delay:0.9s]',
  },
] as const

const ROUTINE_ITEMS = [
  {
    step: 1,
    label: '정돈하기',
    description:
      '세안 후 피부결을 정돈하고 다음 단계 흡수를 높여줘요. 수분을 빠르게 채우고 피부 pH를 맞춰주는 첫 번째 레이어예요.',
    className: 'absolute left-4 top-5.5',
  },
  {
    step: 2,
    label: '집중 케어하기',
    description:
      '피부 고민에 가장 직접적으로 작용하는 단계예요. 나에게 맞는 핵심 성분이 가장 고농도로 담겨 있어요.',
    className: 'absolute left-21 top-26.5',
  },
  {
    step: 3,
    label: '마무리하기',
    description:
      '수분과 영양이 날아가지 않도록 마무리해줘요. 피부 상태에 따라 가벼운 로션부터 진한 크림까지 선택할 수 있어요.',
    className: 'absolute left-10 top-47.5',
  },
  {
    step: 4,
    label: '자외선 차단하기',
    description: '낮 동안 자외선으로부터 피부를 보호해요. 어떤 루틴도 선크림 없이는 완성되지 않아요.',
    className: 'absolute left-25 top-68.5',
  },
] as const

function LandingPage() {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const authRedirectState = isAuthRedirectState(location.state) ? location.state : null
  const hasAuthRedirect = authRedirectState !== null

  useLandingStepReveal(pageRef)
  useHeroParallax(pageRef)

  return (
    <MobilePage
      className="bg-common-0"
      header={<PageHeader className="!bg-transparent" showLogo />}
      mainClassName="px-0"
    >
      <div ref={pageRef} className="-mt-12 landing-page mx-auto w-full max-w-[390px] overflow-x-hidden bg-common-0">
        <section className="hero relative min-h-[712px] h-[100dvh] overflow-hidden bg-common-0">
          <div className="hero-bg pointer-events-none absolute inset-0" aria-hidden>
            <div className="layer layer-1 absolute" />
            <div className="layer layer-2 absolute" />
            <div className="layer layer-3 absolute" />
          </div>

          <div className="hero-content relative z-[2] flex min-h-[600px] h-[100dvh] flex-col items-center">
            <div className="landing-hero-copy mt-[220px] w-full">
              <h1 className="text-center text-[32px] font-bold leading-[46.24px] text-neutral-800">
                피부에 맞게
                <br />
                하나씩 레이어드
              </h1>

              <p className="mx-auto mt-[48px] w-fit whitespace-nowrap text-center text-[18px] leading-[25.2px] text-black">
                레이어드는 피부 상태와 고민에 맞춰
                <br />
                루틴을 추천하는 스킨케어 서비스입니다
              </p>
            </div>

            {hasAuthRedirect ? (
              <AlertMessage className="mt-6 w-[calc(100%-40px)]" size="md" variant="warning">
                {authRedirectState?.from ?? AUTH_UI_TEXT.protectedPageFallback}
                {AUTH_UI_TEXT.protectedPageHintSuffix}
              </AlertMessage>
            ) : null}

            <div className="landing-hero-copy mt-10 w-[calc(100%-128px)]">
              <Link
                className={cn(
                  buttonVariants({ variant: 'dark' }),
                  'landing-hero-cta-pulse inline-flex h-12 w-full items-center justify-center rounded-full px-6 py-3 text-[16px] font-medium leading-[23.68px]',
                )}
                to={APP_ROUTES.surveySteps}
              >
                피부 진단 시작하기
              </Link>
            </div>

            <MockLoginButton className="landing-hero-copy mt-3 h-12 w-[calc(100%-128px)]" />
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-8 left-1/2 z-[2] h-[25px] w-[36px] -translate-x-1/2 select-none"
              src={heroScrollArrow}
            />
          </div>

        </section>

        <section className="bg-neutral-50 px-5 pb-20 pt-10">
          <header className="mb-15 mt-10">
            <h2 className="w-[240px] text-[24px] font-bold leading-[32.4px] text-neutral-800">
              3단계로 완성하는
              <br />
              나만의 스킨케어 루틴
            </h2>
          </header>

          <article className="landing-step step overflow-hidden rounded-[12px]" data-landing-step>
            <div className="bg-common-0 p-3">
              <p className="text-[18px] font-bold leading-[25.56px] text-primary-300">01</p>
              <h3 className="mt-1 text-[22px] font-bold leading-[29.7px] text-neutral-800">피부 진단</h3>
              <p className="mt-5 text-[15px] leading-[22.2px] text-neutral-800">
                로그인하지 않아도, 증상 기반 15가지 질문으로 피부 타입과 고민을 파악할 수 있어요.
              </p>
            </div>

            <div className="chat-wrap relative h-[267px] overflow-hidden bg-common-0">
              {CHAT_BUBBLES.map((bubble) => (
                <div
                  key={bubble.text}
                  className={cn(
                    'bubble px-3 py-3 text-[10px] font-medium leading-[15px] text-common-0',
                    bubble.className,
                  )}
                >
                  {bubble.text}
                </div>
              ))}
            </div>
          </article>

          <article className="landing-step step mt-10 rounded-[12px] bg-common-0 p-3" data-landing-step>
            <p className="text-[18px] font-bold leading-[25.56px] text-primary-300">02</p>
            <h3 className="mt-1 text-[22px] font-bold leading-[29.7px] text-neutral-800">결과 분석</h3>
            <p className="mt-5 text-[15px] leading-[22.2px] text-neutral-600">
              나의 피부 상태를 분석하고 필요한 성분을 우선순위로 추천해요.
            </p>
          </article>

          <article className="landing-step step mt-10 overflow-hidden rounded-[12px]" data-landing-step>
            <div className="bg-common-0 p-3">
              <p className="text-[18px] font-bold leading-[25.56px] text-primary-300">03</p>
              <h3 className="mt-1 text-[22px] font-bold leading-[29.7px] text-neutral-800">아침·저녁 루틴 가이드</h3>
              <p className="mt-5 text-[15px] leading-[22.2px] text-neutral-600">
                진단 결과를 바탕으로 토너부터 선크림까지, 카테고리별 제품 추천과 루틴까지 안내해요.
              </p>
            </div>

            <div className="routine relative h-[365px] bg-common-0">
              <div className="absolute left-1/2 top-0 h-[365px] w-full -translate-x-1/2">
                <img
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute top-10 h-[307px] w-full select-none"
                  src={routineConnectorLine}
                />

                {ROUTINE_ITEMS.map((item) => (
                  <div
                    key={item.step}
                    className={cn(
                      'flex flex-col justify-start routine-item w-[223px] rounded-[8px] border border-primary-400 bg-common-0 p-2 transition-transform duration-300 hover:translate-x-[6px]',
                      item.className,
                    )}
                  >
                    <div className="inline-flex items-center gap-[5.32px]">
                      <div className="inline-grid h-[14.63px] w-[14.63px] place-items-center rounded-[5.32px] bg-neutral-800 text-[7.98px] font-bold text-neutral-50">
                        <span className="leading-none">{item.step}</span>
                      </div>
                      <p className="text-[10.64px] font-semibold text-black">{item.label}</p>
                    </div>
                    <p className="mt-[10px] text-[8.65px] leading-[12.1px] text-black">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="landing-cta relative overflow-hidden bg-neutral-800 px-5 py-20">
          <div className="relative z-[1] mx-auto flex w-full flex-col items-center gap-12 text-center">
            <h2 className="text-[28px] font-bold leading-[37.52px] text-common-0">
              피부에 맞게
              <br />
              하나씩 레이어드
            </h2>

            <div className="w-[calc(100%-88px)]">
              <p className="text-[14px] font-medium leading-[20.44px] text-neutral-150">지금 바로 시작해 보세요!</p>

              <Link
                className={cn(
                  buttonVariants({ variant: 'primary' }),
                  'mt-3 inline-flex h-[56px] w-full items-center justify-center rounded-full px-6 py-4 text-[16px] font-medium leading-[23.68px] text-neutral-800',
                )}
                to={APP_ROUTES.surveySteps}
              >
                <span>피부 진단 시작하기</span>
                <ArrowRight className="ml-2 size-5" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MobilePage>
  )
}

export default LandingPage
