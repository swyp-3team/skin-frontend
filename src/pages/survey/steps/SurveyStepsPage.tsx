import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import AlertMessage from '../../../components/common/AlertMessage'
import LoadingScreen from '../../../components/common/LoadingScreen'
import TitleCloseHeader from '../../../components/headers/TitleCloseHeader'
import MobilePage from '../../../components/MobilePage'
import {
  SURVEY_PAGE_TITLE,
  SURVEY_STATUS_MESSAGES,
  SURVEY_STEP_MILESTONE_TOASTS,
  SURVEY_VALIDATION_MESSAGES,
} from '../../../constants/survey'
import { CONCERN_STEP } from '../../../domain/surveyCodes'
import { notify } from '../../../lib/notify'
import { useSurveyProgressStore } from '../../../stores/surveyProgressStore'
import type { SurveyStepAnswer } from '../../../stores/surveyProgressStore'
import { useSurveySubmit } from '../useSurveySubmit'
import SurveyStepActions from './SurveyStepActions'
import SurveyStepSection from './SurveyStepSection'
import { useSurveyQuestions } from './useSurveyQuestions'

const TWO_COLUMN_FROM_STEP = 14
const MAX_CONCERN_SELECTIONS = 2
const MILESTONE_TOAST_BY_STEP = new Map(SURVEY_STEP_MILESTONE_TOASTS.map((item) => [item.step, item] as const))
const CONCERN_SELECTION_LIMIT_MESSAGE = `\uCD5C\uB300 ${MAX_CONCERN_SELECTIONS}\uAC1C\uAE4C\uC9C0 \uC120\uD0DD\uD560 \uC218 \uC788\uC5B4\uC694.`

function isAnswered(value: SurveyStepAnswer | undefined) {
  if (typeof value === 'number') {
    return true
  }

  return Array.isArray(value) && value.length > 0
}

function toSelectedOptionNumbers(value: SurveyStepAnswer | undefined) {
  if (typeof value === 'number') {
    return [value]
  }

  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.filter((item) => Number.isInteger(item) && item > 0))]
}

function SurveyStepsPage() {
  const navigate = useNavigate()

  const { currentStep, answersByStep, setStepAnswer, setStepAnswers, nextStep, prevStep, goToStep } = useSurveyProgressStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      answersByStep: state.answersByStep,
      setStepAnswer: state.setStepAnswer,
      setStepAnswers: state.setStepAnswers,
      nextStep: state.nextStep,
      prevStep: state.prevStep,
      goToStep: state.goToStep,
    })),
  )

  const { questions, isLoading, error: questionLoadError } = useSurveyQuestions()
  const submitMutation = useSurveySubmit()
  const [isDelaying, setIsDelaying] = useState(false)
  const [isAwaitingNavigation, setIsAwaitingNavigation] = useState(false)
  const submitStartTimeRef = useRef<number | null>(null)
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNavigateRef = useRef<(() => void) | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isOptionPressed, setIsOptionPressed] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')
  const shownMilestoneToastIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    return () => {
      notify.dismiss()
      if (delayTimerRef.current !== null) {
        clearTimeout(delayTimerRef.current)
      }
    }
  }, [])

  const totalSteps = questions.length
  const safeCurrentStep = Math.min(currentStep, Math.max(totalSteps, 1))
  const isFinalStep = safeCurrentStep === totalSteps
  const activeQuestion = questions[safeCurrentStep - 1]
  const isConcernStep = activeQuestion?.step === CONCERN_STEP
  const activeAnswer = activeQuestion ? answersByStep[activeQuestion.step] : undefined
  const selectedOptionNumbers = toSelectedOptionNumbers(activeAnswer)

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 32 : -32,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -32 : 32,
      opacity: 0,
    }),
  }

  useEffect(() => {
    if (!isLoading && !questionLoadError && totalSteps > 0 && currentStep > totalSteps) {
      goToStep(totalSteps)
    }
  }, [currentStep, goToStep, isLoading, questionLoadError, totalSteps])

  const clearErrors = () => {
    setValidationError(null)
    submitMutation.reset()
    setIsDelaying(false)
    setIsAwaitingNavigation(false)
    pendingNavigateRef.current = null
    if (delayTimerRef.current !== null) {
      clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
    }
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
    setIsOptionPressed(false)
    setTransitionDirection('forward')
    nextStep()
  }

  const handleNext = () => {
    clearErrors()
    if (activeQuestion && !isAnswered(answersByStep[activeQuestion.step])) {
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

  const handleOptionSelect = (optionNumber: number) => {
    if (!activeQuestion) return

    clearErrors()

    if (activeQuestion.step === CONCERN_STEP) {
      const alreadySelected = selectedOptionNumbers.includes(optionNumber)

      if (alreadySelected) {
        setStepAnswers(
          activeQuestion.step,
          selectedOptionNumbers.filter((selected) => selected !== optionNumber),
        )
        return
      }

      if (selectedOptionNumbers.length >= MAX_CONCERN_SELECTIONS) {
        setValidationError(CONCERN_SELECTION_LIMIT_MESSAGE)
        return
      }

      const nextSelections = [...selectedOptionNumbers, optionNumber]
      setStepAnswers(activeQuestion.step, nextSelections)
      if (nextSelections.length >= MAX_CONCERN_SELECTIONS) {
        advanceStep()
      }
      return
    }

    const alreadySelected = answersByStep[activeQuestion.step] === optionNumber
    setStepAnswer(activeQuestion.step, optionNumber)
    if (!isFinalStep && !alreadySelected) {
      advanceStep()
    }
  }

  const handleSubmit = () => {
    notify.dismiss()
    clearErrors()

    const firstUnanswered = questions.find((item) => !isAnswered(answersByStep[item.step]))
    if (firstUnanswered) {
      setTransitionDirection('backward')
      goToStep(questions.indexOf(firstUnanswered) + 1)
      setValidationError(SURVEY_VALIDATION_MESSAGES.missingAnswers)
      return
    }

    submitStartTimeRef.current = Date.now()
    submitMutation.mutate(undefined, {
      onSuccess: (outcome) => {
        const elapsed = Date.now() - (submitStartTimeRef.current ?? Date.now())
        const remaining = Math.max(0, 1500 - elapsed)

        pendingNavigateRef.current = () => {
          if (outcome.kind === 'full') {
            navigate(createResultDetailPath(outcome.result.resultId))
          } else {
            navigate(APP_ROUTES.surveyResult)
          }
        }

        setIsAwaitingNavigation(true)
        if (remaining > 0) {
          setIsDelaying(true)
          delayTimerRef.current = setTimeout(() => {
            setIsDelaying(false)
            delayTimerRef.current = null
          }, remaining)
        }
      },
    })
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

  const progressPercent = totalSteps > 0 ? Math.min((safeCurrentStep / totalSteps) * 100, 100) : 0
  const showSubmitLoading = submitMutation.isPending || isDelaying
  const shouldRenderPageContent = !showSubmitLoading && !isAwaitingNavigation

  return (
    <>
      <AnimatePresence
        onExitComplete={() => {
          const doNavigate = pendingNavigateRef.current
          if (!doNavigate) {
            return
          }
          pendingNavigateRef.current = null
          doNavigate()
        }}
      >
        {showSubmitLoading ? <LoadingScreen key="submit-loading" text="성분을 분석하고 있어요" /> : null}
      </AnimatePresence>

      {shouldRenderPageContent ? (
        <MobilePage
          className="bg-gradient-to-b from-neutral-800 from-[5%] to-neutral-600 to-50%"
          header={<TitleCloseHeader title={SURVEY_PAGE_TITLE} onClose={() => navigate(APP_ROUTES.home)} tone="dark" />}
          mainClassName="flex flex-col p-0"
          footer={
            <div className="px-6 pt-4 pb-5">
              {validationError ? (
                <div className="pb-3">
                  <AlertMessage variant="warning">{validationError}</AlertMessage>
                </div>
              ) : null}

              {submitMutation.error ? (
                <div className="pb-3">
                  <AlertMessage variant="error">{submitMutation.error.message}</AlertMessage>
                </div>
              ) : null}

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
          }
        >
          <section className="flex flex-1 min-h-0 w-full flex-col">
            <div className="px-6 py-2">
              <div className="h-2 w-full overflow-hidden rounded-[20px] bg-neutral-600">
                <div
                  className="h-full bg-primary-300 transition-[width] duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {activeQuestion ? (
              <div className="shrink-0 min-h-[135px] px-6 flex items-center">
                <h2 className="text-[22px] font-medium leading-[33px] text-common-0">{activeQuestion.question}</h2>
              </div>
            ) : null}

            <div className="flex flex-1 min-h-0 flex-col rounded-t-[20px] bg-common-0">
              <AnimatePresence mode="wait" custom={transitionDirection}>
                {activeQuestion ? (
                  <motion.div
                    key={activeQuestion.step}
                    className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-6"
                    custom={transitionDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.1, ease: 'easeOut' }}
                  >
                    <SurveyStepSection
                      columns={activeQuestion.step >= TWO_COLUMN_FROM_STEP ? 2 : 1}
                      hideTitle
                      isSelected={(optionNumber) => selectedOptionNumbers.includes(optionNumber)}
                      name={`step-${activeQuestion.step}`}
                      onOptionPointerDown={() => setIsOptionPressed(true)}
                      onOptionPointerUp={() => setIsOptionPressed(false)}
                      onSelect={handleOptionSelect}
                      options={activeQuestion.options}
                      selectionMode={isConcernStep ? 'multiple' : 'single'}
                      title={activeQuestion.question}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </section>
        </MobilePage>
      ) : null}
    </>
  )
}

export default SurveyStepsPage

