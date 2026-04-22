import { cn } from '@/lib/utils'

export interface ResultTabItem {
  id: string
  label: string
}

interface ResultTabBarProps {
  items: readonly ResultTabItem[]
  activeTabId: string
  onChange: (tabId: string) => void
  mode: 'equal' | 'scroll'
  className?: string
}

function ResultTabBar({ items, activeTabId, onChange, mode, className }: ResultTabBarProps) {
  if (mode === 'equal') {
    return (
      <nav className={cn('border-b border-neutral-100 px-0 pt-5', className)}>
        <div className="grid w-full grid-cols-2 items-center gap-2">
          {items.map((item) => {
            const isActive = activeTabId === item.id
            return (
              <button
                className={cn(
                  'inline-flex items-center justify-center border-b-2 px-2 py-2.5 text-[18px] leading-[25.56px] transition-colors',
                  isActive
                    ? 'border-neutral-800 font-bold text-neutral-800'
                    : 'border-transparent font-medium text-neutral-400',
                )}
                key={item.id}
                onClick={() => onChange(item.id)}
                type="button"
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <nav className={cn('overflow-x-auto border-b border-neutral-100', className)}>
      <div className="flex min-w-max items-center gap-2 px-0">
        {items.map((item) => {
          const isActive = activeTabId === item.id
          return (
            <button
              className={cn(
                'inline-flex items-center justify-center border-b-2 px-2.5 py-2.5 text-[18px] leading-[25.56px] whitespace-nowrap transition-colors',
                isActive
                  ? 'border-neutral-800 font-bold text-neutral-800'
                  : 'border-transparent font-medium text-neutral-400',
              )}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default ResultTabBar
