import { josa } from 'es-hangul'
import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import Chip from '../../../components/common/Chip'
import SectionTitle from '../../../components/common/SectionTitle'
import SurfaceCard from '../../../components/common/SurfaceCard'
import MobilePage from '../../../components/MobilePage'
import LoginDialog from '../../../components/survey/LoginDialog'
import LoginGateOverlay from '../../../components/survey/LoginGateOverlay'
import { SURVEY_RESULT_COPY } from '../../../constants/survey'
import { INGREDIENT_GROUP_LABELS } from '../../../domain/surveyConfig'
import { queryKeys } from '../../../lib/queryKeys'
import { selectIsAuthenticated, useAuthStore } from '../../../stores/authStore'
import { useSurveyStore } from '../../../stores/surveyStore'
import type { PreviewResult } from '../../../api/types'
import { useLoginAndPromote } from './useLoginAndPromote'

const getParticle = josa.pick

function SurveyResultPage() {
  const queryClient = useQueryClient()
  const previewResult = queryClient.getQueryData<PreviewResult>(queryKeys.surveyPreview())
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const latestResultId = useSurveyStore((state) => state.latestResultId)
  const { isLoginModalOpen, setIsLoginModalOpen, isPromoting, promoteToFullResult } = useLoginAndPromote()

  if (isAuthenticated && latestResultId != null) {
    return <Navigate replace to={createResultDetailPath(latestResultId)} />
  }

  if (!previewResult) {
    return <Navigate replace to={APP_ROUTES.survey} />
  }

  const top1 = previewResult.top3[0]
  const top2 = previewResult.top3[1]
  const top1Label = top1 ? INGREDIENT_GROUP_LABELS[top1.group] : ''
  const top2Label = top2 ? INGREDIENT_GROUP_LABELS[top2.group] : ''
  const headingConnector = top1Label ? getParticle(top1Label, '와/과') : ''

  return (
    <MobilePage
      headingLeft={"Layerd"}
      headingCenter={null}
      headingRight={null}
    >
      <section className="space-y-7 pb-10">
        <div className="items-center text-page-title font-semibold tracking-tight text-slate-950 leading-[1.4] space-y-0.5">
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
            {previewResult.top3.map((item) => (
              <Chip key={item.group} variant="outlined">
                {INGREDIENT_GROUP_LABELS[item.group]}
              </Chip>
            ))}
          </div>
          <p className="text-xs leading-5 text-slate-500">{previewResult.summary}</p>
          <p className="text-xs text-slate-700">
            {previewResult.top3.map((item) => item.ingredients.slice(0, 2).join(', ')).join(' · ')}
          </p>
        </SurfaceCard>

        <div className="space-y-3">
          <SectionTitle className="whitespace-pre-line">{SURVEY_RESULT_COPY.routineSectionTitle}</SectionTitle>
          <div className="relative">
            <div className="space-y-2">
              {previewResult.top3.map((item, idx) => (
                <SurfaceCard className="space-y-1.5" density="compact" key={item.group}>
                  <Chip>STEP {idx + 1}</Chip>
                  <p className="text-xs leading-5 text-slate-700">{item.reason}</p>
                </SurfaceCard>
              ))}
            </div>
            <LoginGateOverlay onClick={() => setIsLoginModalOpen(true)} />
          </div>
        </div>
      </section>

      <LoginDialog
        isPromoting={isPromoting}
        onLogin={promoteToFullResult}
        onOpenChange={setIsLoginModalOpen}
        open={isLoginModalOpen}
      />
    </MobilePage>
  )
}

export default SurveyResultPage
