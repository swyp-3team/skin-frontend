/* eslint-disable react-refresh/only-export-components */

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:bg-neutral-200 disabled:text-neutral-300 disabled:border-transparent aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          'bg-primary-400 text-neutral-0 hover:bg-primary-500 active:bg-primary-600',
        secondary:
          'bg-primary-50 text-primary-600 hover:bg-primary-100 active:bg-primary-200',
        tertiary:
          'bg-neutral-100 text-neutral-600 hover:bg-neutral-150 active:bg-neutral-200 ',
        outline:
          'border-neutral-300 bg-neutral-0 text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100',
        ghost:
          'bg-transparent text-primary-400 hover:bg-primary-50 active:bg-primary-100 active:text-primary-600',
        dark:
          'bg-neutral-800 text-neutral-0 hover:bg-neutral-900',
        kakao:
          'bg-social-kakao text-social-kakao-fg hover:opacity-90 active:opacity-80',
        google:
          'bg-social-google-bg text-social-google-fg hover:opacity-90 active:opacity-80',
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        // 소형 인라인 버튼 (에러 페이지, 보조 액션 등)
        compact: "h-9 gap-1.5 px-5 text-sm",
        // 페이지 단위 풀너비 버튼 (CTA, 주요 액션)
        page: "h-auto w-full px-6 py-3 text-sm",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-lg': "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
