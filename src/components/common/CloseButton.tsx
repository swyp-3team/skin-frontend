import { IconX } from '@tabler/icons-react'

interface CloseButtonProps {
  onClick: () => void
  'aria-label'?: string
}

function CloseButton({ onClick, 'aria-label': ariaLabel = '닫기' }: CloseButtonProps) {
  return (
    <button onClick={onClick} type="button" aria-label={ariaLabel}>
      <IconX size={20} stroke={1.9} color="#1A1C18" />
    </button>
  )
}

export default CloseButton
