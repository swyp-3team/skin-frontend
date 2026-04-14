import { cva } from 'class-variance-authority'

export const surveyOptionCardVariants = cva(
  'block w-full rounded-full py-3 px-6 text-center justify-content content-center text-base font-medium transition-all duration-150 cursor-pointer select-none',
  {
    variants: {
      selected: {
        true: 'bg-[#B3E5E3] text-white',
        false: 'bg-[#EAF8F7] text-[#1A1C18] opacity-70 hover:bg-[#CCEEED] hover:opacity-100',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)
