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
    isSubmitting,
    submitError,
    setAnswer,
    nextStep,
    prevStep,
    goToStep,
    setSkinType,
    toggleConcern,
    submitSurvey,
    clearSubmitError,
  } = useSurveyStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      answersByQuestionId: state.answersByQuestionId,
      skinType: state.skinType,
      concerns: state.concerns,
      isSubmitting: state.isSubmitting,
      submitError: state.submitError,
      setAnswer: state.setAnswer,
      nextStep: state.nextStep,
      prevStep: state.prevStep,
      goToStep: state.goToStep,
      setSkinType: state.setSkinType,
      toggleConcern: state.toggleConcern,
      submitSurvey: state.submitSurvey,
      clearSubmitError: state.clearSubmitError,
    }))
  )

  const { questions, isLoadingQuestions, questionLoadError } = useSurveyQuestions()
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
    clearSubmitError()
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

  const handleSubmit = async () => {
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

    try {
      await submitSurvey({
        isAuthenticated,
        accessToken,
      })
      navigate(APP_ROUTES.surveyResult)
    } catch {
      // submitError는 store에서 관리
    }
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

        {submitError ? (
          <p className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </p>
        ) : null}

        <SurveyStepActions
          currentStep={currentStep}
          isFinalStep={isFinalStep}
          isSubmitting={isSubmitting}
          onNext={handleNext}
          onPrev={() => {
            clearErrors()
            prevStep()
          }}
          onSubmit={() => {
            void handleSubmit()
          }}
        />
      </section>
    </MobilePage>
  )
}

export default SurveyStepsPage
