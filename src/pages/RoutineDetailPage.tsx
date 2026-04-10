import { Link, useParams } from "react-router-dom";

import { createRoutineProductsPath } from "../app/routes";
import PageHeading from "../components/common/PageHeading";
import SurfaceCard from "../components/common/SurfaceCard";
import MobilePage from "../components/MobilePage";

const routineSteps = [
  { category: "토너", guide: "진정 성분으로 피부결을 정돈해 주세요." },
  { category: "세럼", guide: "집중 성분으로 고민 부위를 관리해 주세요." },
  { category: "크림", guide: "보습막을 형성해 장벽을 마무리해 주세요." },
];

function RoutineDetailPage() {
  const { id } = useParams();

  return (
    <MobilePage>
      <section className="space-y-5">
        <PageHeading>나의 루틴</PageHeading>

        <SurfaceCard className="space-y-3">
          <p className="text-xs text-slate-500">루틴 그룹 #{id ?? "-"}</p>
          <p className="text-sm leading-6 text-slate-700">
            아침과 저녁 루틴을 분리해 피부 컨디션에 맞게 관리하세요.
          </p>
        </SurfaceCard>

        <div className="space-y-3">
          <p className="text-base font-semibold text-slate-900">아침 루틴</p>
          <div className="space-y-2 rounded-[8px] bg-card-bg p-4">
            {routineSteps.map((step) => (
              <div className="flex items-start gap-3" key={`am-${step.category}`}>
                <span className="rounded-[8px] bg-chip-bg px-3 py-1 text-xs font-medium text-slate-800">
                  {step.category}
                </span>
                <p className="pt-0.5 text-xs leading-5 text-slate-700">{step.guide}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-base font-semibold text-slate-900">저녁 루틴</p>
          <div className="space-y-2 rounded-[8px] bg-card-bg p-4">
            {routineSteps.map((step) => (
              <div className="flex items-start gap-3" key={`pm-${step.category}`}>
                <span className="rounded-[8px] bg-chip-bg px-3 py-1 text-xs font-medium text-slate-800">
                  {step.category}
                </span>
                <p className="pt-0.5 text-xs leading-5 text-slate-700">{step.guide}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          className="block w-full rounded-[10px] border border-card-border bg-card-bg px-4 py-3 text-center text-sm font-semibold text-slate-800"
          to={createRoutineProductsPath(id ?? 1)}
        >
          루틴 제품 보기
        </Link>
      </section>
    </MobilePage>
  );
}

export default RoutineDetailPage;
