import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './AppLayout'
import ProtectedRoute from './ProtectedRoute'
import { APP_ROUTES } from './routes'
import HomePage from '../pages/HomePage'
import MyPage from '../pages/MyPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import RoutineDetailPage from '../pages/RoutineDetailPage'
import ResultDetailPage from '../pages/results/ResultDetailPage'
import ResultProductsPage from '../pages/results/ResultProductsPage'
import ResultRoutinePage from '../pages/results/ResultRoutinePage'
import SurveyIntroPage from '../pages/survey/SurveyIntroPage'
import SurveyResultPage from '../pages/survey/result/SurveyResultPage'
import SurveyStepsPage from '../pages/survey/steps/SurveyStepsPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />} path={APP_ROUTES.home}>
          {/* 공개 라우트 */}
          <Route element={<HomePage />} index />
          <Route element={<SurveyIntroPage />} path={APP_ROUTES.survey} />
          <Route element={<SurveyStepsPage />} path={APP_ROUTES.surveySteps} />
          <Route element={<SurveyResultPage />} path={APP_ROUTES.surveyResult} />
          <Route element={<ProductDetailPage />} path={APP_ROUTES.productDetail} />

          {/* 보호 라우트 (로그인 필요) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ResultDetailPage />} path={APP_ROUTES.resultDetail} />
            <Route element={<ResultRoutinePage />} path={APP_ROUTES.resultRoutine} />
            <Route element={<ResultProductsPage />} path={APP_ROUTES.resultProducts} />
            <Route element={<MyPage />} path={APP_ROUTES.myPage} />
            <Route element={<RoutineDetailPage />} path={APP_ROUTES.routineDetail} />
          </Route>

          <Route element={<NotFoundPage />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
