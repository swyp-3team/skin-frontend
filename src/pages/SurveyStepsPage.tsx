import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES } from '../app/routes'
import MobilePage from '../components/MobilePage'
import { useAuthStore } from '../stores/authStore'
import { useSurveyStore } from '../stores/surveyStore'
import ConcernStepSection from './survey-steps/ConcernStepSection'
import QuestionStepSection from './survey-steps/QuestionStepSection'
import SkinTypeStepSection from './survey-steps/SkinTypeStepSection'
import SurveyProgressHeader from './survey-steps/SurveyProgressHeader'
import SurveyStepActions from './survey-steps/SurveyStepActions'
import { useSurveyQuestions } from './survey-steps/useSurveyQuestions'
import { useSurveySubmit } from './survey-steps/useSurveySubmit'

function SurveyStepsPage() {
  const navigate = useNavigate()

  const { isAuthenticated, accessToken } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      accessToken: state.accessToken,
    }))
  )

  const {
    currentStep,
    answersByQuestionId,
    skinType,
    concerns,
    setAnswer,
    nextStep,
    prevStep,
    goToStep,
    setSkinType,
    toggleConcern,
  } = useSurveyStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      answersByQuestionId: state.answersByQuestionId,
      skinType: state.skinType,
      concerns: state.concerns,
      setAnswer: state.setAnswer,
      nextStep: state.nextStep,
      prevStep: state.prevStep,
      goToStep: state.goToStep,
      setSkinType: state.setSkinType,
      toggleConcern: state.toggleConcern,
    }))
  )

  const { questions, isLoadingQuestions, questionLoadError } = useSurveyQuestions()
  const submitMutation = useSurveySubmit()
  const [validationError, setValidationError] = useState<string | null>(null)

  const totalSteps = useMemo(() => Math.max(questions.length + 2, 2), [questions.length])
  const isQuestionStep = currentStep <= questions.length
  const isSkinTypeStep = currentStep === questions.length + 1
  const isFinalStep = currentStep === totalSteps
  const activeQuestion = isQuestionStep ? questions[currentStep - 1] : null

  useEffect(() => {
    if (currentStep > totalSteps) {
      goToStep(totalSteps)
    }
  }, [currentStep, goToStep, totalSteps])

  const clearErrors = () => {
    setValidationError(null)
    submitMutation.reset()
  }

  const handleNext = () => {
    clearErrors()

    if (isQuestionStep && activeQuestion) {
      const answer = answersByQuestionId[activeQuestion.questionId]
      if (answer === undefined) {
        setValidationError('해당 문항의 응답을 선택해주세요.')
        return
      }
    }

    if (isSkinTypeStep && !skinType) {
      setValidationError('피부 타입을 선택해주세요.')
      return
    }

    if (currentStep < totalSteps) {
      nextStep()
    }
  }

  const handleSubmit = () => {
    clearErrors()

    const firstMissingQuestion = questions.find((question) => answersByQuestionId[question.questionId] === undefined)

    if (firstMissingQuestion) {
      const missingStep = questions.findIndex((question) => question.questionId === firstMissingQuestion.questionId)
      goToStep(missingStep + 1)
      setValidationError('응답하지 않은 문항이 있습니다. 먼저 응답을 완료해주세요.')
      return
    }

    if (!skinType) {
      goToStep(questions.length + 1)
      setValidationError('피부 타입 선택이 필요합니다.')
      return
    }

    submitMutation.mutate(
      { isAuthenticated, accessToken },
      { onSuccess: () => navigate(APP_ROUTES.surveyResult) },
    )
  }

  if (isLoadingQuestions) {
    return (
      <MobilePage>
        <div className="rounded-[12px] bg-card-bg px-4 py-5 text-sm text-slate-700">
          설문 문항을 불러오는 중입니다...
        </div>
      </MobilePage>
    )
  }

  if (questionLoadError) {
    return (
      <MobilePage>
        <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">
          {questionLoadError}
        </div>
      </MobilePage>
    )
  }

  return (
    <MobilePage>
      <section className="space-y-6">
        <SurveyProgressHeader currentStep={currentStep} totalSteps={totalSteps} />

        {isQuestionStep && activeQuestion ? (
          <QuestionStepSection
            activeQuestion={activeQuestion}
            answersByQuestionId={answersByQuestionId}
            onAnswerChange={(questionId, value) => {
              setAnswer(questionId, value)
              clearErrors()
            }}
          />
        ) : null}

        {isSkinTypeStep ? (
          <SkinTypeStepSection
            onSkinTypeChange={(value) => {
              setSkinType(value)
              clearErrors()
            }}
            skinType={skinType}
          />
        ) : null}

        {isFinalStep ? (
          <ConcernStepSection
            concerns={concerns}
            onConcernToggle={(value) => {
              toggleConcern(value)
              clearErrors()
            }}
          />
        ) : null}

        {validationError ? (
          <p className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {validationError}
          </p>
        ) : null}

        {submitMutation.error ? (
          <p className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitMutation.error.message}
          </p>
        ) : null}

        <SurveyStepActions
          currentStep={currentStep}
          isFinalStep={isFinalStep}
          isSubmitting={submitMutation.isPending}
          onNext={handleNext}
          onPrev={() => {
            clearErrors()
            prevStep()
          }}
          onSubmit={handleSubmit}
        />
      </section>
    </MobilePage>
  )
}

export default SurveyStepsPage
