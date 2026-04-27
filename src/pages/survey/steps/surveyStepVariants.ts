import { cva } from 'class-variance-authority'

export const surveyOptionCardVariants = cva(
  'flex h-full w-full items-center justify-start rounded-xl border px-5 py-4 text-left text-base leading-[23.68px] font-normal text-neutral-800 transition-colors duration-150 cursor-pointer select-none',
  {
    variants: {
      selected: {
        true: '',
        false: '',
      },
      layout: {
        default: '',
        grid: '',
      },
    },
    compoundVariants: [
      { layout: 'default', selected: false, class: 'border-neutral-150 bg-common-0 hover:bg-primary-50' },
      { layout: 'default', selected: true, class: 'border-neutral-150 bg-primary-100' },
      { layout: 'grid', selected: false, class: 'border-neutral-150 bg-common-0 hover:bg-primary-50' },
      { layout: 'grid', selected: true, class: 'border-neutral-150 bg-primary-100' },
    ],
    defaultVariants: {
      selected: false,
      layout: 'default',
    },
  },
)
