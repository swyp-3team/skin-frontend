import type { ReactNode } from 'react'

import confirmWarningIcon from '@/assets/icons/common/confirm-warning.svg'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description: ReactNode
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
  title?: string
}

function ConfirmActionDialog({
  open,
  onOpenChange,
  description,
  onConfirm,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDisabled = false,
  title = '확인',
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="w-[calc(100%-80px)] max-w-[310px] overflow-hidden rounded-[12px] bg-common-0 p-5 shadow-none">
        <AlertDialogTitle className="sr-only">{title}</AlertDialogTitle>

        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <img alt="" aria-hidden className="size-8" src={confirmWarningIcon} />

            <div className="flex w-[240px] flex-col items-center gap-1">
              <p className="w-full text-center text-base font-semibold leading-[23.68px] text-neutral-800">{title}</p>
              <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[20.44px] text-neutral-600">
                {description}
              </AlertDialogDescription>
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <AlertDialogCancel
              className="h-10 flex-1 rounded-lg border border-neutral-100 bg-common-0 px-5 text-[15px] font-semibold leading-[22.2px] text-neutral-600 hover:bg-common-0 active:bg-common-0"
              size="default"
              variant="outline"
            >
              {cancelLabel}
            </AlertDialogCancel>

            <AlertDialogAction
              className="h-10 flex-1 rounded-lg border border-neutral-800 bg-neutral-800 px-5 text-[15px] font-medium leading-[22.2px] text-common-0 hover:bg-neutral-800 active:bg-neutral-800 disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-300"
              disabled={confirmDisabled}
              onClick={onConfirm}
              size="default"
              type="button"
              variant="outline"
            >
              {confirmLabel}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmActionDialog
