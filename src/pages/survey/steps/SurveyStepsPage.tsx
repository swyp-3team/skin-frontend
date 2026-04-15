import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { APP_ROUTES, createResultDetailPath } from '../../../app/routes'
import AlertMessage from '../../../components/common/AlertMessage'
import MobilePage from '../../../components/MobilePage'
import { CloseButton } from '../../../components/MobilePageHeading'
import { SURVEY_PAGE_TITLE, SURVEY_RESULT_COPY, SURVEY_STATUS_MESSAGES, SURVEY_VALIDATION_MESSAGES } from '../../../constants/survey'
import { useAuthStore } from '../../../stores/authStore'
import { useSurveyStore } from '../../../stores/surveyStore'
import type { Concern, SkinTypeSelection } from '../../../types/domain'
import { useSurveySubmit } from '../useSurveySubmit'
import SurveyStepActions from './SurveyStepActions'
import SurveyStepSection from './SurveyStepSection'
import { useSurveyQuestions } from './useSurveyQuestions'
import { useSurveyStepConfig } from './useSurveyStepConfig'

function SurveyStepsPage() {
  const navigate = useNavigate()

  const accessToken = useAuthStore((state) => state.accessToken)

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
    })),
  )

  const { questions, isLoadingQuestions, questionLoadError } = useSurveyQuestions()
  const { stepConfig } = useSurveyStepConfig()
  const submitMutation = useSurveySubmit()
  const [validationError, setValidationError] = useState<string | null>(null)

  const totalSteps = Math.max(questions.length + 2, 2)
  const safeCurrentStep = Math.min(currentStep, totalSteps)
  const isQuestionStep = safeCurrentStep <= questions.length
  const isSkinTypeStep = safeCurrentStep === questions.length + 1
  const isFinalStep = safeCurrentStep === totalSteps
  const activeQuestion = isQuestionStep ? questions[safeCurrentStep - 1] : null

  useEffect(() => {
    if (!isLoadingQuestions && !questionLoadError && currentStep > totalSteps) {
      goToStep(totalSteps)
    }
  }, [currentStep, goToStep, isLoadingQuestions, questionLoadError, totalSteps])

  const clearErrors = () => {
    setValidationError(null)
    submitMutation.reset()
  }

  const handleNext = () => {
    clearErrors()

    if (isQuestionStep && activeQuestion) {
      const answer = answersByQuestionId[activeQuestion.questionId]
      if (answer === undefined) {
        setValidationError(SURVEY_VALIDATION_MESSAGES.questionRequired)
        return
      }
    }

    if (isSkinTypeStep && !skinType) {
      setValidationError(SURVEY_VALIDATION_MESSAGES.skinTypeRequiredForStep)
      return
    }

    if (safeCurrentStep < totalSteps) {
      nextStep()
    }
  }

  const handleSubmit = () => {
    clearErrors()

    const firstMissingQuestion = questions.find((question) => answersByQuestionId[question.questionId] === undefined)

    if (firstMissingQuestion) {
      const missingStep = questions.findIndex((question) => question.questionId === firstMissingQuestion.questionId)
      goToStep(missingStep + 1)
      setValidationError(SURVEY_VALIDATION_MESSAGES.missingAnswers)
      return
    }

    if (!skinType) {
      goToStep(questions.length + 1)
      setValidationError(SURVEY_VALIDATION_MESSAGES.skinTypeRequiredForSubmit)
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

  if (isLoadingQuestions) {
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
        onPrev={() => {
          clearErrors()
          prevStep()
        }}
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
      <section className="w-full px-4  flex flex-col items-center">
        {isQuestionStep && activeQuestion ? (
          <SurveyStepSection<number>
            name={`question-${activeQuestion.questionId}`}
            options={activeQuestion.options}
            title={activeQuestion.text}
            isSelected={(value) => answersByQuestionId[activeQuestion.questionId] === value}
            onChange={(value) => {
              setAnswer(activeQuestion.questionId, value)
              clearErrors()
            }}
          />
        ) : null}

        {isSkinTypeStep && stepConfig ? (
          <SurveyStepSection<string>
            columns={2}
            name="skinType"
            options={stepConfig.skinTypeStep.options}
            title={stepConfig.skinTypeStep.title}
            isSelected={(value) => skinType === value}
            onChange={(value) => {
              setSkinType(value as SkinTypeSelection)
              clearErrors()
            }}
          />
        ) : null}

        {isFinalStep && stepConfig ? (
          <SurveyStepSection<string>
            columns={2}
            inputType="checkbox"
            name="concerns"
            options={stepConfig.concernStep.options}
            title={stepConfig.concernStep.title}
            isSelected={(value) => concerns.includes(value as Concern)}
            onChange={(value) => {
              toggleConcern(value as Concern)
              clearErrors()
            }}
          />
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
