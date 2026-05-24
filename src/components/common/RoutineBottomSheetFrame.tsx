import type { ReactNode } from 'react'

import moreCloseIcon from '@/assets/icons/routine/sheet-close.svg'
import { DrawerContentBottom, DrawerRoot } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

interface RoutineBottomSheetFrameProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  closeAriaLabel?: string
  sheetClassName?: string
  children: ReactNode
}

function RoutineBottomSheetFrame({
  open,
  onOpenChange,
  title,
  closeAriaLabel,
  sheetClassName,
  children,
}: RoutineBottomSheetFrameProps) {
  return (
    <DrawerRoot open={open} onOpenChange={onOpenChange}>
      <DrawerContentBottom aria-label={title} className={cn(sheetClassName)}>
        <div className="w-full pt-2.5">
          <div className="flex w-full items-center justify-between px-5 py-2.5">
            <div className="flex flex-1 items-center gap-2.5">
              <h2 className="text-base font-medium leading-[23.68px] text-neutral-800">{title}</h2>
            </div>

            <button
              aria-label={closeAriaLabel ?? `${title} 시트 닫기`}
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 p-1"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <img alt="" aria-hidden className="size-5" src={moreCloseIcon} />
            </button>
          </div>
        </div>

        {children}
      </DrawerContentBottom>
    </DrawerRoot>
  )
}

export default RoutineBottomSheetFrame
