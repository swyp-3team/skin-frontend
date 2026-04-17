import { cva } from 'class-variance-authority'

export const surveyOptionCardVariants = cva(
  'block w-full rounded-full py-3 px-6 text-center justify-content content-center text-base text-neutral-800 font-medium transition-all duration-150 cursor-pointer select-none',
  {
    variants: {
      selected: {
        true: '',
        false: '',
      },
      layout: {
        default: '',
        grid: 'border border-neutral-100',
      },
    },
    compoundVariants: [
      { layout: 'default', selected: false, class: 'bg-primary-50/70 hover:bg-primary-100/70' },
      { layout: 'default', selected: true, class: 'bg-primary-150/70' },
      { layout: 'grid', selected: false, class: 'bg-common-0 hover:bg-neutral-50' },
      { layout: 'grid', selected: true, class: 'bg-primary-100 border-none' },
    ],
    defaultVariants: {
      selected: false,
      layout: 'default',
    },
  },
)
