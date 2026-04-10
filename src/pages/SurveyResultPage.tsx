import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { APP_ROUTES } from "../app/routes";
import PageHeading from "../components/common/PageHeading";
import PillCtaLink from "../components/common/PillCtaLink";
import MobilePage from "../components/MobilePage";
import LoginDialog from "../components/survey/LoginDialog";
import LoginGateOverlay from "../components/survey/LoginGateOverlay";
import RecommendedProductsList from "../components/survey/RecommendedProductsList";
import RoutineSection from "../components/survey/RoutineSection";
import { MOCK_ACCESS_TOKEN } from "../constants/auth";
import { useAuthStore } from "../stores/authStore";
import { useSurveyStore } from "../stores/surveyStore";
import { isFullResult } from "./survey-result/guards";
import { toRoutineItems } from "./survey-result/toRoutineItems";

function SurveyResultPage() {
  const { result, submitSurvey } = useSurveyStore(
    useShallow((state) => ({
      result: state.lastResult,
      submitSurvey: state.submitSurvey,
    })),
  );

  const { isAuthenticated, loginMock } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      loginMock: state.loginMock,
    })),
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  if (!result) {
    return (
      <MobilePage>
        <div className="space-y-6">
          <h2 className="text-page-title-lg leading-[1.35] font-semibold tracking-tight text-slate-950">
            설문 결과가 없습니다
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            설문 완료 후 이 페이지에서 루틴과 제품 추천 결과를 확인할 수 있습니다.
          </p>
          <PillCtaLink className="px-6 py-3 text-sm" to={APP_ROUTES.survey}>
            설문 시작하기
          </PillCtaLink>
        </div>
      </MobilePage>
    );
  }

  const fullResult = isFullResult(result) ? result : null;
  const fullResultVisible = isAuthenticated && fullResult !== null;

  const promoteToFullResult = async (providerLabel: string) => {
    setIsPromoting(true);
    loginMock(providerLabel);

    try {
      await submitSurvey({
        isAuthenticated: true,
        accessToken: MOCK_ACCESS_TOKEN,
      });
      setIsLoginModalOpen(false);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <MobilePage>
      <section className="relative space-y-7 pb-10">
        <PageHeading className="whitespace-pre-line">
          [{result.skinType}] 타입을 기준으로{"\n"}맞춤 루틴을 추천드려요.
        </PageHeading>

        <div className="space-y-3">
          <p className="text-lg font-semibold text-slate-900">필요</p>
          <article className="rounded-[8px] bg-card-bg px-4 py-3">
            <p className="text-xs text-slate-700">
              {result.top3[0]?.group ?? "HYDRATION"} 성분군이 우선입니다.
            </p>
            <p className="mt-2 text-xs text-slate-500">{result.summary}</p>
            <p className="mt-2 text-xs text-slate-700">
              {result.top3.map((item) => item.ingredients.slice(0, 2).join(", ")).join(" · ")}
            </p>
          </article>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">추천 루틴</h3>
          <RoutineSection items={toRoutineItems(result, "am")} title="아침" />
          <RoutineSection items={toRoutineItems(result, "pm")} title="저녁" />
        </div>

        {fullResultVisible && fullResult ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">추천 제품</h3>
            <RecommendedProductsList products={fullResult.recommendedProducts} />
          </div>
        ) : null}

        {!fullResultVisible ? (
          <LoginGateOverlay
            onClick={() => {
              setIsLoginModalOpen(true);
            }}
          />
        ) : null}
      </section>

      <LoginDialog
        isPromoting={isPromoting}
        onLoginGoogle={() => {
          void promoteToFullResult("Google");
        }}
        onLoginKakao={() => {
          void promoteToFullResult("Kakao");
        }}
        onOpenChange={setIsLoginModalOpen}
        open={isLoginModalOpen}
      />
    </MobilePage>
  );
}

export default SurveyResultPage;
