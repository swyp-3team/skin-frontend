import { useEffect, useState } from "react";

function SurveyPage() {
  const [selectedSkinType, setSelectedSkinType] = useState("");

  const skinTypes = ["건성", "지성", "복합성", "민감성"];
  const optionBaseClassName =
    "flex h-[130px] w-full items-center justify-center rounded-lg border px-5 py-4 text-xl font-semibold tracking-tight transition duration-150 ease-out";
  const idleOptionClassName =
    "border-option-border bg-white shadow-option hover:-translate-y-[3px] hover:scale-[1.03] hover:border-blue-500 hover:shadow-option-hover active:translate-y-px active:scale-[0.98]";
  const selectedOptionClassName =
    "border-blue-500 bg-option-selected shadow-option";

  useEffect(() => {
    const saved = localStorage.getItem("selectedSkinType");
    if (saved) {
      setSelectedSkinType(saved);
    }
  }, []);

  const handleSelect = (type: string) => {
    setSelectedSkinType(type);
    localStorage.setItem("selectedSkinType", type);
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
        <h1 className="text-2xl font-bold text-slate-800">Q1. 당신의 피부 타입은?</h1>

        <ul className="mx-auto grid w-[90%] list-none grid-cols-2 place-items-center gap-7.5 p-0 py-12.5">
          {skinTypes.map((type) => (
            <li key={type} className="w-full">
              <button
                type="button"
                onClick={() => handleSelect(type)}
                className={`${optionBaseClassName} ${
                  selectedSkinType === type
                    ? selectedOptionClassName
                    : idleOptionClassName
                }`}
              >
                {type}
              </button>
            </li>
          ))}
        </ul>

        <div className="text-base font-medium text-slate-600">
          선택한 피부 타입:{" "}
          <span className="font-bold text-slate-900">
            {selectedSkinType || "없음"}
          </span>
        </div>
      </main>
    </div>
  );
}
export default SurveyPage;
