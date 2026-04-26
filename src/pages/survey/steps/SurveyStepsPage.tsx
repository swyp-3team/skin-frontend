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
import { useSurveyProgressStore } from '../../../stores/surveyProgressStore'
import { useSurveySubmit } from '../useSurveySubmit'
import SurveyStepActions from './SurveyStepActions'
import SurveyStepSection from './SurveyStepSection'
import { useSurveyQuestions } from './useSurveyQuestions'

const TWO_COLUMN_FROM_STEP = 14
const MILESTONE_TOAST_BY_STEP = new Map(SURVEY_STEP_MILESTONE_TOASTS.map((item) => [item.step, item] as const))

function SurveyStepsPage() {
  const navigate = useNavigate()

  const { currentStep, answersByStep, setStepAnswer, nextStep, prevStep, goToStep } = useSurveyProgressStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      answersByStep: state.answersByStep,
      setStepAnswer: state.setStepAnswer,
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
  const shownMilestoneToastIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    return () => {
      notify.dismiss()
    }
  }, [])

  const totalSteps = questions.length
  const safeCurrentStep = Math.min(currentStep, Math.max(totalSteps, 1))
  const isFinalStep = safeCurrentStep === totalSteps
  const activeQuestion = questions[safeCurrentStep - 1]

  const enterClass =
    transitionDirection === 'forward'
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

  const showMilestoneToast = (step: number) => {
    const milestoneToast = MILESTONE_TOAST_BY_STEP.get(step)

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
      showMilestoneToast(nextQuestion.step)
    }
    setTransitionDirection('forward')
    nextStep()
  }

  const handleNext = () => {
    clearErrors()
    if (activeQuestion && answersByStep[activeQuestion.step] === undefined) {
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

  const handlePointerSelect = (optionNumber: number) => {
    if (!activeQuestion) return

    const alreadySelected = answersByStep[activeQuestion.step] === optionNumber
    setStepAnswer(activeQuestion.step, optionNumber)

    if (!isFinalStep && !alreadySelected) {
      advanceStep()
    }
  }

  const handleSubmit = () => {
    clearErrors()

    const firstUnanswered = questions.find((item) => answersByStep[item.step] === undefined)
    if (firstUnanswered) {
      setTransitionDirection('backward')
      goToStep(questions.indexOf(firstUnanswered) + 1)
      setValidationError(SURVEY_VALIDATION_MESSAGES.missingAnswers)
      return
    }

    submitMutation.mutate(undefined, {
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
          <div key={activeQuestion.step} className={`w-full fill-mode-both ${enterClass}`}>
            <SurveyStepSection
              columns={activeQuestion.step >= TWO_COLUMN_FROM_STEP ? 2 : 1}
              isSelected={(optionNumber) => answersByStep[activeQuestion.step] === optionNumber}
              name={`step-${activeQuestion.step}`}
              onOptionPointerDown={() => setIsOptionPressed(true)}
              onOptionPointerUp={() => setIsOptionPressed(false)}
              onPointerSelect={handlePointerSelect}
              onSelect={(optionNumber) => {
                setStepAnswer(activeQuestion.step, optionNumber)
                clearErrors()
              }}
              options={activeQuestion.options}
              title={activeQuestion.question}
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
