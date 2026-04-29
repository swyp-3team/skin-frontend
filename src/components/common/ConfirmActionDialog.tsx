import type { ReactNode } from 'react'

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
      <AlertDialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-[8px] border border-neutral-100 bg-common-0 p-0 shadow-none sm:w-[280px]">
        <AlertDialogTitle className="sr-only">{title}</AlertDialogTitle>

        <div className="flex items-center justify-center gap-2.5 px-[18px] py-6">
          <AlertDialogDescription className="text-center text-sm font-medium leading-[20.44px] text-neutral-800">
            {description}
          </AlertDialogDescription>
        </div>

        <div className="flex items-center">
          <AlertDialogCancel
            className="h-[45px] w-1/2 rounded-none border border-neutral-100 bg-transparent px-2.5 text-base font-medium leading-[23.68px] text-neutral-500 hover:bg-transparent active:bg-transparent"
            size="default"
            variant="outline"
          >
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            className="h-[45px] w-1/2 rounded-none border border-neutral-100 bg-transparent px-2.5 text-base font-medium leading-[23.68px] text-primary-500 hover:bg-transparent active:bg-transparent disabled:bg-transparent disabled:text-neutral-300"
            disabled={confirmDisabled}
            onClick={onConfirm}
            size="default"
            type="button"
            variant="outline"
          >
            {confirmLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmActionDialog
