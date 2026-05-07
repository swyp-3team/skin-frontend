# Skin Survey (Layerd Frontend)

피부 설문 단계 응답을 저장하고 마지막 단계에서 결과 API를 호출하는 React + TypeScript + Vite 프로젝트입니다.

## 핵심 기능

- 전체 라우팅 골격
  - `/`
  - `/survey`
  - `/survey/steps`
  - `/survey/result`
  - `/results/:id` (보호)
  - `/results/:id/routine` (보호)
  - `/results/:id/products` (보호)
  - `/mypage` (보호)
  - `/mypage/results` (보호)
  - `/mypage/routines` (보호)
  - `/mypage/routines/:id` (보호)
  - `/products/:id`
- `zustand` 기반 설문 상태 관리 + `persist`
- 단계별 응답 저장 후 마지막 단계에서 1회 제출
- API 클라이언트 `mock/live` 전환 구조
- live 인증 복구 정책
  - 모든 API 요청은 `credentials: 'include'`로 쿠키를 포함합니다.
  - `401` 응답 시 `POST /api/v1/auth/refresh`로 accessToken 재발급을 1회 시도합니다.
  - refresh 성공 시 원요청을 1회 재시도합니다.
  - refresh 실패 시 인증/캐시 상태를 정리하고 `/landing`으로 이동합니다.
- 설문 결과(`/survey/result`)와 전체 결과(`/results/:id`)는 공통 화면 컴포넌트를 사용하며, 미리보기는 블러 게이트만 추가됩니다.

## 마이페이지 상태 규칙

- 마이페이지는 아래 3가지 상태로 렌더링됩니다.
  - `diagnosis_routine`: 진단 결과 O + 루틴 저장 O
  - `diagnosis_only`: 진단 결과 O + 루틴 저장 X
  - `empty`: 진단 결과 X + 루틴 저장 X
- 상태 기준 데이터:
  - 진단 결과: `surveyResult.latestResultId` + 결과 조회 성공
  - 루틴 저장: `surveyResult.savedRoutineKey`
- 오류 복구 정책:
  - 결과 조회 `401/404`: `latestResultId`/`savedRoutineKey` 초기화
  - 루틴 조회 `401/404`: `savedRoutineKey` 초기화
- 마이페이지 미리보기는 진단 이력 3건, 루틴 1건만 노출합니다.
- `전체보기`는 각각 `/mypage/results`, `/mypage/routines` 목록 페이지로 이동합니다.

## 실행

```bash
npm install
npm run dev
```

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 타입 검사 + 프로덕션 빌드
- `npm run lint`: ESLint 실행
- `npm run preview`: 빌드 결과 미리보기

## 환경 변수

- `VITE_API_MODE`: `mock`(기본) | `live`
- `VITE_API_BASE_URL`: live 모드 API base (기본 `https://api.layerd.co.kr/api/v1`)
  - 로그인 쿠키가 `api.layerd.co.kr` 도메인에 저장되므로, 인증 API는 `https://api.layerd.co.kr/api/v1`로 직접 호출합니다.
  - `credentials: 'include'` 요청이 동작하려면 백엔드 CORS가 `https://layerd.co.kr` Origin과 credential 포함 요청을 허용해야 합니다.
  - `/api/v1` 프록시 경로는 공개 API 확인에는 사용할 수 있지만, `api.layerd.co.kr` 쿠키 인증에는 적합하지 않습니다.

## 설문 상태 저장 규칙

- 레거시 호환 키: `survey.selectedSkinType`
- 설문 세션 키: `survey.session`
- 인증(모의) 세션 키: `auth.mockSession`

## 디렉터리 개요

```text
src/
  app/
  api/
  pages/
  stores/
  types/
  SurveyPage.tsx
```
