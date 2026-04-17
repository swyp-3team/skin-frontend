import { toast, type ExternalToast } from 'sonner'

import { cn } from './utils'

export type ToastTone = 'neutral' | 'primary'

interface MilestoneToastInput {
  id: string
  message: string
  tone?: ToastTone
  options?: ExternalToast
}

const DEFAULT_TOAST_DURATION = 2000

const milestoneBaseClass =
  '!w-full max-w-[390px] mx-auto h-full inline-flex items-center justify-center gap-[13px] rounded-[8px] px-3 py-2 text-base font-semibold leading-[23.68px] break-words opacity-60'

const milestoneToneClassMap: Record<ToastTone, string> = {
  neutral: 'bg-neutral-800/60 text-neutral-0',
  primary: 'bg-primary-500 text-neutral-0',
}

function milestone({ id, message, tone = 'neutral', options }: MilestoneToastInput) {
  return toast(message, {
    id,
    duration: DEFAULT_TOAST_DURATION,
    unstyled: true,
    classNames: {
      toast: cn(milestoneBaseClass, milestoneToneClassMap[tone]),
      title: 'm-0 font-sans',
    },
    ...options,
    position: 'bottom-center',
  })
}

function success(message: string, options?: ExternalToast) {
  return toast.success(message, { duration: DEFAULT_TOAST_DURATION, ...options, position: 'bottom-center' })
}

function error(message: string, options?: ExternalToast) {
  return toast.error(message, { duration: DEFAULT_TOAST_DURATION, ...options, position: 'bottom-center' })
}

function info(message: string, options?: ExternalToast) {
  return toast.info(message, { duration: DEFAULT_TOAST_DURATION, ...options, position: 'bottom-center' })
}

function dismiss(id?: string | number) {
  toast.dismiss(id)
}

export const notify = {
  milestone,
  success,
  error,
  info,
  dismiss,
}
