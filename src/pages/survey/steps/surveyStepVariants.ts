import { cva } from 'class-variance-authority'

/**
 * 설문 선택지 카드 스타일 변형
 * - question: 전체 너비 pill 버튼 (질문 응답)
 * - descriptive: 설명이 포함된 카드 (피부 타입, 고민 선택)
 */
export const surveyOptionCardVariants = cva(
  'block w-full rounded-full border transition-colors duration-150 cursor-pointer select-none',
  {
    variants: {
      layout: {
        question: 'py-3 px-6 text-center text-base font-semibold',
        descriptive: 'rounded-2xl py-3 px-4 text-left',
      },
      selected: {
        true: 'border-[#1A1C18] bg-[#1A1C18] text-white',
        false: 'border-[#EDEEED] bg-white text-[#3A3D3B] hover:bg-[#EDEEED]',
      },
    },
    compoundVariants: [
      {
        layout: 'descriptive',
        selected: true,
        className: 'border-[#1A1C18] bg-[#1A1C18]/[0.06] text-[#1A1C18]',
      },
    ],
    defaultVariants: {
      layout: 'question',
      selected: false,
    },
  },
)
