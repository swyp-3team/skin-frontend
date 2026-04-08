import { useState } from "react";

type SkinType = "dry" | "oily" | "combination" | "sensitive";

type SkinTypeOption = {
  value: SkinType;
  label: string;
  description: string;
};

const STORAGE_KEY = "survey.selectedSkinType";

const skinTypeOptions: readonly SkinTypeOption[] = [
  {
    value: "dry",
    label: "건성",
    description: "쉽게 당기고 각질이 올라오는 편이에요.",
  },
  {
    value: "oily",
    label: "지성",
    description: "번들거림과 피지 분비가 빠르게 느껴져요.",
  },
  {
    value: "combination",
    label: "복합성",
    description: "부위에 따라 건조함과 유분감이 함께 있어요.",
  },
  {
    value: "sensitive",
    label: "민감성",
    description: "자극이나 변화에 예민하게 반응하는 편이에요.",
  },
];

function isSkinType(value: string): value is SkinType {
  return skinTypeOptions.some((option) => option.value === value)
}

function readStoredSkinType(): SkinType | null {
  if (typeof window === "undefined") return null;

  const savedValue = window.localStorage.getItem(STORAGE_KEY)
  return savedValue && isSkinType(savedValue) ? savedValue : null;
}

function SurveyPage() {
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType | null>(
    () => readStoredSkinType(),
  );

  const selectedOption = skinTypeOptions.find(
    (option) => option.value === selectedSkinType,
  );

  const handleSelect = (skinType: SkinType) => {
    setSelectedSkinType(skinType);
    window.localStorage.setItem(STORAGE_KEY, skinType);
  };

  return (
    <div className="min-h-dvh bg-[linear-gradient(to_bottom,white,#eff6ff,#e2ebff)]">
      <header className="sticky top-0 z-50 bg-surface shadow-menu">
        <div className="mx-auto flex h-17.5 w-full max-w-120 items-center px-6">
          <div className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
            Skin Survey
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-70px)] w-full max-w-120 flex-col bg-[linear-gradient(to_bottom,white,#f0f5ff)] px-6 pt-17.5 pb-16">
        <div className="mb-10">
          <p className="text-sm font-semibold tracking-[0.18em] text-sky-600 uppercase">
            Question 1
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            당신의 피부 타입은 무엇인가요?
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            현재 피부 상태와 가장 가까운 항목 하나를 선택해 주세요.
          </p>
        </div>

        <fieldset className="flex flex-1 flex-col">
          <legend className="sr-only">피부 타입 선택</legend>
          <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 sm:gap-7.5">
            {skinTypeOptions.map((option) => {
              const checked = selectedSkinType === option.value;

              return (
                <li key={option.value} className="w-full">
                  <label className="block w-full">
                    <input
                      checked={checked}
                      className="peer sr-only"
                      name="skin-type"
                      onChange={() => handleSelect(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span
                      className={`flex min-h-[130px] w-full flex-col items-center justify-center rounded-lg border px-5 py-4 text-center transition duration-150 ease-out peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-sky-500 ${
                        checked
                          ? "border-sky-500 bg-option-selected shadow-option ring-2 ring-sky-200"
                          : "border-option-border bg-white shadow-option hover:-translate-y-[3px] hover:scale-[1.03] hover:border-sky-500 hover:shadow-option-hover active:translate-y-px active:scale-[0.98]"
                      }`}
                    >
                      <span className="text-xl font-semibold tracking-tight text-slate-900">
                        {option.label}
                      </span>
                      <span className="mt-2 text-sm leading-6 text-slate-500">
                        {option.description}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <p className="mt-10 text-base font-medium text-slate-600">
          선택한 피부 타입:{" "}
          <output
            aria-label="선택한 피부 타입"
            className="font-bold text-slate-900"
          >
            {selectedOption?.label ?? "없음"}
          </output>
        </p>
      </main>
    </div>
  );
}

export default SurveyPage;
