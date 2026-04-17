import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import AlertMessage from '../../../components/common/AlertMessage'
import TitleCloseHeader from '../../../components/mobile-page/TitleCloseHeader'
import MobilePage from '../../../components/MobilePage'
import {
  SURVEY_PAGE_TITLE,
  SURVEY_RESULT_COPY,
  SURVEY_STATUS_MESSAGES,
  SURVEY_STEP_MILESTONE_TOASTS,
  SURVEY_VALIDATION_MESSAGES,
} from '../../../constants/survey'
import { notify } from '../../../lib/notify'
import { useAuthStore } from '../../../stores/authStore'
import { useSurveyStore } from '../../../stores/surveyStore'
import { useSurveySubmit } from '../useSurveySubmit'
import SurveyStepActions from './SurveyStepActions'
import SurveyStepSection from './SurveyStepSection'
import { useSurveyQuestions } from './useSurveyQuestions'

// Q14, Q15는 선택지가 짧은 유형 분류 문항으로 2열 레이아웃 적용
const TWO_COLUMN_FROM_QUESTION_ID = 14
const MILESTONE_TOAST_BY_QUESTION_ID = new Map(
  SURVEY_STEP_MILESTONE_TOASTS.map((item) => [item.questionId, item] as const),
)

function SurveyStepsPage() {
  const navigate = useNavigate()

  const accessToken = useAuthStore((state) => state.accessToken)

  const { currentStep, answersByQuestionId, setAnswer, nextStep, prevStep, goToStep } = useSurveyStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      answersByQuestionId: state.answersByQuestionId,
      setAnswer: state.setAnswer,
      nextStep: state.nextStep,
      prevStep: state.prevStep,
      goToStep: state.goToStep,
    })),
  )

  const { questions, isLoading, error: questionLoadError } = useSurveyQuestions()
  const submitMutation = useSurveySubmit()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isOptionPressed, setIsOptionPressed] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')

  // 전환 방향을 추적해 슬라이드 방향 결정 (ref: 불필요한 리렌더 방지)
  const shownMilestoneToastIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    return () => { notify.dismiss() }
  }, [])

  const totalSteps = questions.length
  const safeCurrentStep = Math.min(currentStep, Math.max(totalSteps, 1))
  const isFinalStep = safeCurrentStep === totalSteps
  const activeQuestion = questions[safeCurrentStep - 1]

  const enterClass = transitionDirection === 'forward'
    ? 'animate-in fade-in-75 slide-in-from-right-4 duration-350 ease-out'
    : 'animate-in fade-in-75 slide-in-from-left-4 duration-350 ease-out'

  useEffect(() => {
    if (!isLoading && !questionLoadError && totalSteps > 0 && currentStep > totalSteps) {
      goToStep(totalSteps)
    }
  }, [currentStep, goToStep, isLoading, questionLoadError, totalSteps])

  const clearErrors = () => {
    setValidationError(null)
    submitMutation.reset()
  }

  const showMilestoneToast = (questionId: number) => {
    const milestoneToast = MILESTONE_TOAST_BY_QUESTION_ID.get(questionId)

    if (!milestoneToast || shownMilestoneToastIdsRef.current.has(milestoneToast.toastId)) {
      return
    }

    shownMilestoneToastIdsRef.current.add(milestoneToast.toastId)
    notify.milestone({
      id: milestoneToast.toastId,
      message: milestoneToast.message,
      tone: 'neutral',
    })
  }

  const advanceStep = () => {
    const nextQuestion = questions[safeCurrentStep]
    if (nextQuestion) {
      showMilestoneToast(nextQuestion.questionId)
    }
    setTransitionDirection('forward')
    nextStep()
  }

  const handleNext = () => {
    clearErrors()
    if (activeQuestion && answersByQuestionId[activeQuestion.questionId] === undefined) {
      setValidationError(SURVEY_VALIDATION_MESSAGES.questionRequired)
      return
    }
    advanceStep()
  }

  const handlePrev = () => {
    clearErrors()
    setTransitionDirection('backward')
    prevStep()
  }

  // setAnswer를 advanceStep보다 먼저 호출해야 함
  // Zustand(useSyncExternalStore)는 set 즉시 스토어를 업데이트하므로
  // nextStep 전에 answer가 저장되어 있어야 다음 질문 렌더링이 올바름
  const handlePointerSelect = (value: number) => {
    if (!activeQuestion) return
    const alreadySelected = answersByQuestionId[activeQuestion.questionId] === value
    setAnswer(activeQuestion.questionId, value)
    if (!isFinalStep && !alreadySelected) {
      advanceStep()
    }
  }

  const handleSubmit = () => {
    clearErrors()

    const firstUnanswered = questions.find((q) => answersByQuestionId[q.questionId] === undefined)
    if (firstUnanswered) {
      setTransitionDirection('backward')
      goToStep(questions.indexOf(firstUnanswered) + 1)
      setValidationError(SURVEY_VALIDATION_MESSAGES.missingAnswers)
      return
    }

    submitMutation.mutate(
      { accessToken },
      {
        onSuccess: (outcome) => {
          if (outcome.kind === 'full') {
            navigate(createResultDetailPath(outcome.result.resultId))
          } else {
            navigate(APP_ROUTES.surveyResult)
          }
        },
      },
    )
  }

  if (isLoading) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="info">
          {SURVEY_STATUS_MESSAGES.loadingQuestions}
        </AlertMessage>
      </MobilePage>
    )
  }

  if (questionLoadError) {
    return (
      <MobilePage>
        <AlertMessage size="md" variant="error">
          {questionLoadError}
        </AlertMessage>
      </MobilePage>
    )
  }

  if (submitMutation.isPending) {
    return (
      <MobilePage>
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3">
          <p className="text-lg font-bold text-neutral-800">{SURVEY_RESULT_COPY.submittingTitle}</p>
          <p className="text-sm text-neutral-600/60">{SURVEY_RESULT_COPY.submittingDescription}</p>
        </div>
      </MobilePage>
    )
  }

  const footer = (
    <div className="px-3 pt-4 pb-12">
      <SurveyStepActions
        currentStep={safeCurrentStep}
        isNextHighlighted={isOptionPressed}
        isFinalStep={isFinalStep}
        isSubmitting={submitMutation.isPending}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
      />
    </div>
  )

  return (
    <MobilePage
      header={<TitleCloseHeader title={SURVEY_PAGE_TITLE} onClose={() => navigate(APP_ROUTES.home)} />}
      footer={footer}
    >
      <section className="w-full text-neutral-800 px-4 flex flex-col h-full items-center overflow-hidden">
        {activeQuestion ? (
          <div key={activeQuestion.questionId} className={`w-full fill-mode-both ${enterClass}`}>
            <SurveyStepSection
              columns={activeQuestion.questionId >= TWO_COLUMN_FROM_QUESTION_ID ? 2 : 1}
              name={`question-${activeQuestion.questionId}`}
              options={activeQuestion.options}
              title={activeQuestion.text}
              isSelected={(value) => answersByQuestionId[activeQuestion.questionId] === value}
              onSelect={(value) => {
                setAnswer(activeQuestion.questionId, value)
                clearErrors()
              }}
              onPointerSelect={handlePointerSelect}
              onOptionPointerDown={() => setIsOptionPressed(true)}
              onOptionPointerUp={() => setIsOptionPressed(false)}
            />
          </div>
        ) : null}

        {validationError ? (
          <div className="mt-6">
            <AlertMessage variant="warning">{validationError}</AlertMessage>
          </div>
        ) : null}

        {submitMutation.error ? (
          <div className="mt-6">
            <AlertMessage variant="error">{submitMutation.error.message}</AlertMessage>
          </div>
        ) : null}
      </section>
    </MobilePage>
  )
}

export default SurveyStepsPage
