import { josa } from 'es-hangul'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createResultProductsPath, createResultRoutinePath } from '../../app/routes'
import { ApiError } from '../../api/errors'
import AlertMessage from '../../components/common/AlertMessage'
import Chip from '../../components/common/Chip'
import SectionTitle from '../../components/common/SectionTitle'
import SurfaceCard from '../../components/common/SurfaceCard'
import MobilePage from '../../components/MobilePage'
import RecommendedProductsList from '../../components/survey/RecommendedProductsList'
import { Button, buttonVariants } from '../../components/ui/button'
import { SURVEY_RESULT_COPY } from '../../constants/survey'
import { INGREDIENT_GROUP_LABELS, PRODUCT_CATEGORY_LABELS } from '../../domain/surveyConfig'
import { cn } from '../../lib/utils'
import { createSavedRoutineKey, useSurveyStore } from '../../stores/surveyStore'
import { useResultDetail } from './useResultDetail'

const getParticle = josa.pick

function ResultDetailPage() {
  const navigate = useNavigate()
  const { resultId, data: result, isLoading, error } = useResultDetail()
  const { savedRoutineKey, markRoutineSaved, clearLatestResultId } = useSurveyStore(
    useShallow((state) => ({
      savedRoutineKey: state.savedRoutineKey,
      markRoutineSaved: state.markRoutineSaved,
      clearLatestResultId: state.clearLatestResultId,
    })),
  )
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (!error) return
    const status = error instanceof ApiError ? error.status : 0
    if (status === 401 || status === 404) {
      clearLatestResultId()
      navigate(APP_ROUTES.survey, { replace: true })
    }
  }, [error, clearLatestResultId, navigate])

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          결과를 불러오는 중입니다...
        </AlertMessage>
      </MobilePage>
    )
  }

  if (error || !result) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {error?.message ?? '결과를 불러오지 못했습니다.'}
        </AlertMessage>
      </MobilePage>
    )
  }

  const currentRoutineKey = createSavedRoutineKey(result)
  const isRoutineSaved = savedRoutineKey === currentRoutineKey
  const activeTabIndex = Math.min(activeTab, Math.max(result.top3.length - 1, 0))
  const top1 = result.top3[0]
  const top2 = result.top3[1]

  const top1Label = top1 ? INGREDIENT_GROUP_LABELS[top1.group] : ''
  const top2Label = top2 ? INGREDIENT_GROUP_LABELS[top2.group] : ''
  const headingConnector = top1Label ? getParticle(top1Label, '와/과') : ''

  return (
    <MobilePage>
      <section className="space-y-7 pb-10">
        <div className="space-y-0.5 text-page-title font-semibold tracking-tight text-neutral-900 leading-[1.4]">
          <div>
            {top1 && <Chip variant="white-rounded">{top1Label}</Chip>}
            {top2 ? <span> {headingConnector}</span> : null}
          </div>
          <div>
            {top2 && <Chip variant="white-rounded">{top2Label}</Chip>}
            <span> {getParticle(top2Label || top1Label, '이/가')} 필요해요.</span>
          </div>
        </div>

        <SurfaceCard className="space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {result.top3.map((item) => (
              <Chip key={item.group} variant="outlined">
                {INGREDIENT_GROUP_LABELS[item.group]}
              </Chip>
            ))}
          </div>
          <p className="text-xs leading-5 text-neutral-400">{result.summary}</p>
          <p className="text-xs text-neutral-600">
            {result.top3.map((item) => item.ingredients.slice(0, 2).join(', ')).join(' · ')}
          </p>
        </SurfaceCard>

        <div className="space-y-3">
          <SectionTitle className="whitespace-pre-line">{SURVEY_RESULT_COPY.routineSectionTitle}</SectionTitle>

          <div className="flex flex-wrap gap-2">
            {result.top3.map((item, idx) => (
              <Button
                className={cn(
                  'h-auto rounded-full px-3 py-1.5 text-xs font-medium',
                  activeTabIndex !== idx && 'bg-neutral-100 text-neutral-600 hover:bg-neutral-100 hover:opacity-80',
                )}
                key={item.group}
                onClick={() => setActiveTab(idx)}
                type="button"
                variant={activeTabIndex === idx ? 'dark' : 'ghost'}
              >
                {INGREDIENT_GROUP_LABELS[item.group]}
              </Button>
            ))}
          </div>

          {result.routine[activeTabIndex] ? (
            <SurfaceCard className="space-y-2" density="compact">
              <Chip>{PRODUCT_CATEGORY_LABELS[result.routine[activeTabIndex].category]}</Chip>
              <p className="text-xs leading-5 text-neutral-600">{result.routine[activeTabIndex].guide}</p>
            </SurfaceCard>
          ) : null}

          <Link
            className={cn(
              buttonVariants({ variant: 'tertiary' }),
              'h-auto w-full rounded-[10px] px-4 py-3 text-center text-sm',
            )}
            to={createResultRoutinePath(resultId)}
          >
            {SURVEY_RESULT_COPY.routineLinkCta}
          </Link>

          {!isRoutineSaved ? (
            <Button
              className="h-auto w-full rounded-full px-6 py-3 text-sm"
              onClick={() => markRoutineSaved(result)}
              type="button"
              variant="dark"
            >
              {SURVEY_RESULT_COPY.saveRoutineCta}
            </Button>
          ) : (
            <Link
              className={cn(
                buttonVariants({ variant: 'dark' }),
                'h-auto w-full rounded-full px-6 py-3 text-center text-sm',
              )}
              to="/mypage"
            >
              {SURVEY_RESULT_COPY.routineSavedCta}
            </Link>
          )}
        </div>

        <div className="space-y-3">
          <SectionTitle>{SURVEY_RESULT_COPY.productsPageTitle}</SectionTitle>
          <RecommendedProductsList products={result.recommendedProducts} />
          <Link
            className={cn(
              buttonVariants({ variant: 'tertiary' }),
              'h-auto w-full rounded-[10px] px-4 py-3 text-center text-sm',
            )}
            to={createResultProductsPath(resultId)}
          >
            {SURVEY_RESULT_COPY.moreProductsCta}
          </Link>
        </div>
      </section>
    </MobilePage>
  )
}

export default ResultDetailPage
