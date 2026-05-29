import { useState, type FormEvent } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import RoutineBottomSheetFrame from './RoutineBottomSheetFrame'

interface RoutineNameBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (routineName: string) => void | Promise<void>
  title?: string
  closeAriaLabel?: string
  initialValue?: string
  placeholder?: string
  submitLabel?: string
  submittingLabel?: string
  maxLength?: number
  isSubmitting?: boolean
  submitDisabled?: boolean
  requireChanged?: boolean
}

interface RoutineNameBottomSheetFormProps {
  initialValue: string
  placeholder: string
  submitLabel: string
  submittingLabel: string
  maxLength: number
  isSubmitting: boolean
  submitDisabled: boolean
  requireChanged: boolean
  onSubmit: (routineName: string) => void | Promise<void>
}

function RoutineNameBottomSheetForm({
  initialValue,
  placeholder,
  submitLabel,
  submittingLabel,
  maxLength,
  isSubmitting,
  submitDisabled,
  requireChanged,
  onSubmit,
}: RoutineNameBottomSheetFormProps) {
  const [draft, setDraft] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  const routineNameLength = draft.length
  const trimmedRoutineName = draft.trim()
  const trimmedInitialRoutineName = initialValue.trim()
  const isTyped = routineNameLength > 0
  const isFocusState = !isTyped && isFocused
  const isChangedFromInitial = trimmedRoutineName !== trimmedInitialRoutineName
  const canSubmit =
    trimmedRoutineName.length > 0 &&
    !isSubmitting &&
    !submitDisabled &&
    (!requireChanged || isChangedFromInitial)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    await onSubmit(trimmedRoutineName)
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex w-full flex-col gap-2.5 p-5">
        <div
          className={cn(
            'flex flex-col gap-3 rounded-lg p-3',
            isFocusState ? 'outline outline-2 -outline-offset-2 outline-primary-300' : 'outline outline-1 -outline-offset-1 outline-neutral-150',
          )}
        >
          <div className="inline-flex w-full items-center gap-2.5 px-1">
            <Input
              aria-label="루틴 이름을 입력하세요"
              className={cn(
                'h-auto border-0 bg-transparent p-0 text-[15px] font-normal leading-[22.2px] shadow-none focus-visible:border-0 focus-visible:ring-0 placeholder:text-neutral-200',
                isTyped ? 'text-neutral-800' : 'text-neutral-200',
              )}
              maxLength={maxLength}
              onBlur={() => setIsFocused(false)}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              value={draft}
            />
          </div>

          <div className="flex w-full flex-col items-end justify-center gap-2.5">
            <div className="inline-flex w-full items-center justify-end px-1">
              <span className="text-xs font-medium leading-[16.32px] text-neutral-300">{routineNameLength}</span>
              <span className="text-xs font-medium leading-[16.32px] text-neutral-300">/{maxLength}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5 px-5 pb-5">
        <button
          className={cn(
            'inline-flex w-full min-w-[70px] items-center justify-center rounded-lg px-6 py-3 text-base font-medium leading-[23.68px] transition-colors',
            canSubmit ? 'bg-neutral-800 text-common-0 hover:bg-neutral-900' : 'bg-neutral-100 text-neutral-300',
          )}
          disabled={!canSubmit}
          type="submit"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

function RoutineNameBottomSheet({
  open,
  onOpenChange,
  onSubmit,
  title = '루틴 저장',
  closeAriaLabel,
  initialValue = '',
  placeholder = '루틴 이름을 입력하세요. (예: 여름 아침 루틴)',
  submitLabel = '저장',
  submittingLabel = '저장 중...',
  maxLength = 10,
  isSubmitting = false,
  submitDisabled = false,
  requireChanged = false,
}: RoutineNameBottomSheetProps) {
  return (
    <RoutineBottomSheetFrame
      closeAriaLabel={closeAriaLabel}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      {open ? (
        <RoutineNameBottomSheetForm
          initialValue={initialValue}
          isSubmitting={isSubmitting}
          key={`${title}-${initialValue}`}
          maxLength={maxLength}
          onSubmit={onSubmit}
          placeholder={placeholder}
          requireChanged={requireChanged}
          submitDisabled={submitDisabled}
          submitLabel={submitLabel}
          submittingLabel={submittingLabel}
        />
      ) : null}
    </RoutineBottomSheetFrame>
  )
}

export default RoutineNameBottomSheet
