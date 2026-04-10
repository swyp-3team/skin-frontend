interface SurveyProgressHeaderProps {
  currentStep: number
  totalSteps: number
}

function SurveyProgressHeader({ currentStep, totalSteps }: SurveyProgressHeaderProps) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
        Step {currentStep} / {totalSteps}
      </p>
      <div className="mt-3 h-2 rounded-full bg-[#dddddd]">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
    </div>
  )
}

export default SurveyProgressHeader
