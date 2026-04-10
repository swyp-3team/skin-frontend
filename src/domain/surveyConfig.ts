import type { Concern, SkinType, SkinTypeSelection } from "../types/domain";

export interface SkinTypeOption {
  value: SkinTypeSelection;
  label: string;
  description: string;
}

export interface ConcernOption {
  value: Concern;
  label: string;
  description: string;
}

export const SKIN_TYPE_OPTIONS: readonly SkinTypeOption[] = [
  {
    value: "dry",
    label: "건성",
    description: "당김이 잦고 건조함이 느껴져요",
  },
  {
    value: "oily",
    label: "지성",
    description: "피지와 번들거림이 쉽게 올라와요",
  },
  {
    value: "combination",
    label: "복합성",
    description: "부위별로 건조함과 유분이 함께 있어요",
  },
  {
    value: "sensitive",
    label: "민감성",
    description: "자극에 쉽게 반응하는 편이에요",
  },
];

export const CONCERN_OPTIONS: readonly ConcernOption[] = [
  { value: "DRY", label: "건조", description: "수분 부족과 당김" },
  { value: "SEBUM", label: "피지", description: "유분/번들거림" },
  { value: "ACNE", label: "트러블", description: "뾰루지/염증" },
  { value: "SENSITIVE", label: "민감", description: "붉어짐/자극" },
  { value: "PIGMENTATION", label: "색소", description: "잡티/칙칙함" },
  { value: "AGING", label: "노화", description: "탄력/주름" },
];

export const VALID_CONCERNS: readonly Concern[] = CONCERN_OPTIONS.map(
  (option) => option.value,
);

export const SELECTION_TO_API_SKIN_TYPE: Record<SkinTypeSelection, SkinType> = {
  dry: "DRY",
  oily: "OILY",
  combination: "COMBINATION",
  sensitive: "SENSITIVE",
};
