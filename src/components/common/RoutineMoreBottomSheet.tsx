import moreDeleteIcon from '@/assets/icons/routine/sheet-delete.svg'
import moreEditIcon from '@/assets/icons/routine/sheet-edit.svg'

import RoutineBottomSheetFrame from './RoutineBottomSheetFrame'

interface RoutineMoreBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  title?: string
  editLabel?: string
  deleteLabel?: string
  actionDisabled?: boolean
}

function RoutineMoreBottomSheet({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  title = '더보기',
  editLabel = '수정하기',
  deleteLabel = '삭제하기',
  actionDisabled = false,
}: RoutineMoreBottomSheetProps) {
  return (
    <RoutineBottomSheetFrame
      closeAriaLabel="더보기 시트 닫기"
      onOpenChange={onOpenChange}
      open={open}
      sheetClassName="min-h-[214px]"
      title={title}
    >
      <div className="flex w-full flex-col gap-2.5 px-5 pt-2">
        <div className="flex w-full flex-col gap-2">
          <button
            className="inline-flex w-full items-center gap-2.5 rounded-[12px] bg-neutral-50 px-5 py-3 text-left disabled:opacity-50"
            disabled={actionDisabled}
            onClick={onEdit}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <img alt="" aria-hidden className="size-4" src={moreEditIcon} />
              <span className="text-[15px] font-medium leading-[22.2px] text-neutral-600">{editLabel}</span>
            </span>
          </button>

          <button
            className="inline-flex w-full items-center gap-2.5 rounded-[12px] bg-neutral-50 px-5 py-3 text-left disabled:opacity-50"
            disabled={actionDisabled}
            onClick={onDelete}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <img alt="" aria-hidden className="size-4" src={moreDeleteIcon} />
              <span className="text-[15px] font-medium leading-[22.2px] text-neutral-600">{deleteLabel}</span>
            </span>
          </button>
        </div>
      </div>
    </RoutineBottomSheetFrame>
  )
}

export default RoutineMoreBottomSheet
