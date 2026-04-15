import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import AlertMessage from '../../../components/common/AlertMessage'
import MobilePage from '../../../components/MobilePage'
import { CloseButton } from '../../../components/MobilePageHeading'
import { SURVEY_PAGE_TITLE, SURVEY_RESULT_COPY, SURVEY_STATUS_MESSAGES, SURVEY_VALIDATION_MESSAGES } from '../../../constants/survey'
import { useAuthStore } from '../../../stores/authStore'
import { useSurveyStore } from '../../../stores/surveyStore'
import { useSurveySubmit } from '../useSurveySubmit'
import SurveyStepActions from './SurveyStepActions'
import SurveyStepSection from './SurveyStepSection'
import { useSurveyQuestions } from './useSurveyQuestions'

// Q14, Q15는 선택지가 짧은 유형 분류 문항으로 2열 레이아웃 적용
const TWO_COLUMN_FROM_QUESTION_ID = 14

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

  // 전환 방향을 추적해 슬라이드 방향 결정 (ref: 불필요한 리렌더 방지)
  const directionRef = useRef<'forward' | 'backward'>('forward')

  const totalSteps = questions.length
  const safeCurrentStep = Math.min(currentStep, Math.max(totalSteps, 1))
  const isFinalStep = safeCurrentStep === totalSteps
  const activeQuestion = questions[safeCurrentStep - 1]

  const slideClass = directionRef.current === 'forward'
    ? 'slide-in-from-right-6'
    : 'slide-in-from-left-6'

  useEffect(() => {
    if (!isLoading && !questionLoadError && totalSteps > 0 && currentStep > totalSteps) {
      goToStep(totalSteps)
    }
  }, [currentStep, goToStep, isLoading, questionLoadError, totalSteps])

  const clearErrors = () => {
    setValidationError(null)
    submitMutation.reset()
  }

  const handleNext = () => {
    clearErrors()

    if (activeQuestion && answersByQuestionId[activeQuestion.questionId] === undefined) {
      setValidationError(SURVEY_VALIDATION_MESSAGES.questionRequired)
      return
    }

    directionRef.current = 'forward'
    nextStep()
  }

  const handlePrev = () => {
    clearErrors()
    directionRef.current = 'backward'
    prevStep()
  }

  const handleSubmit = () => {
    clearErrors()

    const firstUnanswered = questions.find((q) => answersByQuestionId[q.questionId] === undefined)
    if (firstUnanswered) {
      directionRef.current = 'backward'
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
          <p className="text-lg font-bold text-[#1A1C18]">{SURVEY_RESULT_COPY.submittingTitle}</p>
          <p className="text-sm text-[#3A3D3B]/60">{SURVEY_RESULT_COPY.submittingDescription}</p>
        </div>
      </MobilePage>
    )
  }

  const footer = (
    <div className="px-3 pt-4 pb-12">
      <SurveyStepActions
        currentStep={safeCurrentStep}
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
      headingCenter={SURVEY_PAGE_TITLE}
      headingRight={<CloseButton onClick={() => navigate(APP_ROUTES.home)} aria-label="설문 닫기" />}
      footer={footer}
    >
      <section className="w-full px-4 flex flex-col h-full items-center overflow-hidden">
        {activeQuestion ? (
          <div key={activeQuestion.questionId} className={`w-full animate-in ${slideClass} duration-200`}>
            <SurveyStepSection
              columns={activeQuestion.questionId >= TWO_COLUMN_FROM_QUESTION_ID ? 2 : 1}
              name={`question-${activeQuestion.questionId}`}
              options={activeQuestion.options}
              title={activeQuestion.text}
              isSelected={(value) => answersByQuestionId[activeQuestion.questionId] === value}
              onChange={(value) => {
                setAnswer(activeQuestion.questionId, value)
                clearErrors()
              }}
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
