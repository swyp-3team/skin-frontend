import { Link, useParams } from "react-router-dom";

import { createProductDetailPath } from "../app/routes";
import PageHeading from "../components/common/PageHeading";
import ProductThumbnail from "../components/common/ProductThumbnail";
import MobilePage from "../components/MobilePage";

const recommendedProducts = [
  { id: 301, brand: "브랜드명", name: "카밍 밸런스 토너", category: "토너" },
  { id: 302, brand: "브랜드명", name: "리페어 앰플 세럼", category: "세럼" },
  { id: 303, brand: "브랜드명", name: "모이스처 베리어 크림", category: "크림" },
];

function RoutineProductsPage() {
  const { id } = useParams();

  return (
    <MobilePage>
      <section className="space-y-5">
        <PageHeading>루틴 제품 추천</PageHeading>
        <p className="text-sm text-slate-600">루틴 그룹 #{id ?? "-"}에 맞는 제품 목록입니다.</p>

        <div className="space-y-3">
          {recommendedProducts.map((product) => (
            <article
              className="flex items-center gap-3 rounded-[8px] border border-card-border bg-white p-2"
              key={product.id}
            >
              <ProductThumbnail />
              <div className="min-w-0 flex-1">
                <p className="text-meta text-slate-500">[{product.brand}]</p>
                <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">{product.category} 단계 추천</p>
              </div>
              <Link
                className="rounded-[6px] px-2 py-1 text-meta font-semibold text-slate-700"
                to={createProductDetailPath(product.id)}
              >
                상세보기
              </Link>
            </article>
          ))}
        </div>
      </section>
    </MobilePage>
  );
}

export default RoutineProductsPage;
