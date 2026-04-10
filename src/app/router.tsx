import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import { APP_ROUTES } from "./routes";
import HomePage from "../pages/HomePage";
import MyPage from "../pages/MyPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import RoutineDetailPage from "../pages/RoutineDetailPage";
import RoutineProductsPage from "../pages/RoutineProductsPage";
import SurveyIntroPage from "../pages/SurveyIntroPage";
import SurveyResultPage from "../pages/SurveyResultPage";
import SurveyStepsPage from "../pages/SurveyStepsPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />} path={APP_ROUTES.home}>
          <Route element={<HomePage />} index />
          <Route element={<SurveyIntroPage />} path={APP_ROUTES.survey} />
          <Route element={<SurveyStepsPage />} path={APP_ROUTES.surveySteps} />
          <Route element={<SurveyResultPage />} path={APP_ROUTES.surveyResult} />

          <Route
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
            path={APP_ROUTES.myPage}
          />

          <Route
            element={
              <ProtectedRoute>
                <RoutineDetailPage />
              </ProtectedRoute>
            }
            path={APP_ROUTES.routineDetail}
          />

          <Route
            element={
              <ProtectedRoute>
                <RoutineProductsPage />
              </ProtectedRoute>
            }
            path={APP_ROUTES.routineProducts}
          />

          <Route element={<ProductDetailPage />} path={APP_ROUTES.productDetail} />
          <Route element={<NotFoundPage />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
