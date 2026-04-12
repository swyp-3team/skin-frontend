import { cva } from 'class-variance-authority'

export const surveyOptionCardVariants = cva('block rounded-[10px] border transition', {
  variants: {
    layout: {
      question: 'px-4 py-3 text-sm font-medium',
      descriptive: 'px-3 py-3',
    },
    selected: {
      true: 'border-slate-900 bg-[#d1d1d1]',
      false: 'border-card-border bg-card-bg',
    },
  },
  compoundVariants: [
    {
      layout: 'question',
      selected: true,
      className: 'text-slate-950',
    },
    {
      layout: 'question',
      selected: false,
      className: 'text-slate-700',
    },
  ],
  defaultVariants: {
    layout: 'question',
    selected: false,
  },
})
