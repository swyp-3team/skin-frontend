import { Link } from 'react-router-dom'

import type { RoutineRecommendedProduct, RoutineStepCategory } from '../../api/types'
import { createProductDetailPath } from '../../app/routes'

import SafeImage from './SafeImage'

const ROUTINE_CARD_CLASS =
  'flex flex-col gap-[15px] rounded-xl outline outline-1 -outline-offset-1 outline-neutral-100 bg-common-0 p-3'
const STEP_BADGE_CLASS =
  'inline-flex px-1.5 py-1 items-center size-[22px] justify-center rounded-[8px] bg-neutral-800 text-[12px] font-bold leading-[16.32px] text-neutral-50'
const PRODUCT_CATEGORY_CHIP_CLASS =
  'inline-flex self-start items-center justify-center rounded bg-primary-50 px-1 py-0.5 text-[10px] font-medium leading-[13px] text-primary-500'
const ROUTINE_PRODUCT_LINK_CLASS = 'inline-flex w-full items-center gap-3 bg-common-0 no-underline'

const ROUTINE_STEP_TITLE_BY_STEP_CATEGORY: Record<RoutineStepCategory, string> = {
  PREPARE: '정돈하기',
  INTENSIVE_CARE: '집중 케어하기',
  MOISTURIZER: '마무리하기',
  SUN_CARE: '자외선 차단하기',
}

const ROUTINE_STEP_GUIDE_BY_STEP_CATEGORY: Record<RoutineStepCategory, string> = {
  PREPARE: '세안 후 피부결을 정돈하고 다음 단계 흡수를 높여줘요. 수분을 빠르게 채우고 피부 pH를 맞춰주는 첫 번째 레이어예요.',
  INTENSIVE_CARE: '피부 고민에 가장 직접적으로 작용하는 단계예요. 나에게 맞는 핵심 성분이 가장 고농도로 담겨 있어요.',
  MOISTURIZER: '수분과 영양이 날아가지 않도록 마무리해줘요. 피부 상태에 따라 가벼운 로션부터 진한 크림까지 선택할 수 있어요.',
  SUN_CARE: '낮 동안 자외선으로부터 피부를 보호해요. 어떤 루틴도 선크림 없이는 완성되지 않아요.',
}

const ROUTINE_PRODUCT_CATEGORY_LABELS: Record<RoutineRecommendedProduct['productCategory'], string> = {
  SKIN: '스킨',
  TONER: '토너',
  LOTION: '로션',
  EMULSION: '에멀전',
  ESSENCE: '에센스',
  SERUM: '세럼',
  AMPOULE: '앰플',
  CREAM: '크림',
  SUN_CARE: '선케어',
}

interface RoutineStepCardProps {
  from: string
  product: RoutineRecommendedProduct
  stepNumber: number
}

function RoutineStepCard({ from, product, stepNumber }: RoutineStepCardProps) {
  return (
    <article className={ROUTINE_CARD_CLASS}>
      <div className="inline-flex items-center gap-2">
        <span className={STEP_BADGE_CLASS}>{stepNumber}</span>
        <h3 className="text-base font-semibold leading-[23.68px] text-black">
          {ROUTINE_STEP_TITLE_BY_STEP_CATEGORY[product.routineStepCategory]}
        </h3>
      </div>

      <p className="text-[13px] font-normal leading-[18.2px] text-black">
        {ROUTINE_STEP_GUIDE_BY_STEP_CATEGORY[product.routineStepCategory]}
      </p>

      <Link className={ROUTINE_PRODUCT_LINK_CLASS} state={{ from }} to={createProductDetailPath(product.productId)}>
        <SafeImage
          alt={product.name}
          className="size-20 rounded object-cover"
          fallbackAlt={`${product.name} 이미지`}
          loading="lazy"
          src={product.imageUrl}
        />
        <div className="inline-flex h-20 min-w-0 flex-1 flex-col justify-between">
          <span className={PRODUCT_CATEGORY_CHIP_CLASS}>{ROUTINE_PRODUCT_CATEGORY_LABELS[product.productCategory]}</span>
          <p className="line-clamp-2 text-xs leading-[16.32px] text-neutral-800">{product.name}</p>
          <div className="inline-flex items-end text-neutral-800">
            <span className="text-xs font-bold leading-[16.32px]">-</span>
            <span className="text-[11px] font-normal leading-[14.3px]">원</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default RoutineStepCard
