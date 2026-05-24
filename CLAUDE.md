# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # 개발 서버 실행 (Vite)
npm run build        # 타입 체크 후 프로덕션 빌드 (tsc -b && vite build)
npm run lint         # ESLint 실행
npm run format       # Prettier로 전체 포맷팅
npm run format:check # 포맷 검사 (CI용)
npm run preview      # 프로덕션 빌드 미리보기
```

테스트 러너는 현재 없음.

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_MODE` | `mock` | `mock` 또는 `live` |
| `VITE_API_BASE_URL` | `https://api.layerd.co.kr/api/v1` | live 모드 API 베이스 URL |
| `VITE_OAUTH_BASE_URL` | (미설정 시 API 베이스 사용) | OAuth 시작 URL 베이스 (선택) |

기본값은 `mock`이므로 `.env` 파일 없이도 앱이 동작함. dev 서버에는 `/api` → `https://api.layerd.co.kr` 프록시가 설정되어 있음 (`vite.config.ts`).

## 아키텍처 개요

**스킨케어 설문 & 루틴 추천 앱.** 사용자가 설문을 완료하면 피부 타입과 고민에 맞는 성분 그룹 및 제품 루틴을 추천함.

### 설문 흐름

설문 문항은 API(`getSurveyQuestions`)에서 로드됨. mock 모드에서는 `src/constants/survey.ts`의 `MOCK_SURVEY_QUESTIONS`(현재 15문항)를 사용. 각 문항은 `step` 값을 가지며, `SurveyStepsPage`가 `useSurveyProgressStore`의 `currentStep`/`answersByStep`로 단계를 관리하고 마지막 단계에서 1회 제출함.

- `step` 1~13 — 5점 척도 단일 선택
- `step` 14 (`CONCERN_STEP`) — 고민 선택, **복수 선택**(`selectionMode='multiple'`)
- `step` 15 (`SKIN_TYPE_STEP`) — 피부 타입 선택, 단일 선택

고민/피부 타입은 별도로 추가된 단계가 아니라 문항 배열(step 14/15)에 포함됨. 단계 식별 상수는 `src/domain/surveyCodes.ts`의 `CONCERN_STEP`, `SKIN_TYPE_STEP`.

### 결과 분기 (인증 여부)

- **비로그인** → `submitSurveyPreview()` → `PreviewApiData` (미리보기 결과). `SurveyResultPage`가 `fromPreviewResult`로 렌더링하고 하단 섹션은 블러 게이트로 가림.
- **로그인** → `submitSurveyResult()` → `ResultDetail` (전체 결과).

미리보기 화면에서 로그인하면 `useLoginAndPromote`의 `promoteToFullResult`로 전체 결과로 승격함. 설문 결과(`/survey/result`)와 전체 결과(`/results/:id`)는 공통 화면 컴포넌트를 공유함.

### API 클라이언트 패턴

`src/api/index.ts`에서 `VITE_API_MODE` 환경 변수로 `mockApiClient`(`mockClient.ts`) / `createLiveApiClient(baseUrl)`(`liveClient.ts`)를 선택해 `apiClient` 싱글턴으로 내보냄. 모든 API 호출은 이 `apiClient`를 통해 이루어짐. 인터페이스는 `src/api/client.ts`의 `ApiClient`.

live 모드 인증 복구 정책:

- 모든 요청은 `credentials: 'include'`로 쿠키를 포함함.
- `401` 응답 시 `POST /api/v1/auth/refresh`로 accessToken 재발급을 1회 시도 (본문을 안전하게 재전송할 수 없으면 재시도하지 않음).
- 재발급 성공 시 원요청을 1회 재시도.
- 재발급 실패 시 `auth:session-expired` 이벤트로 인증/캐시 상태를 정리하고 랜딩 페이지(`/landing`)로 이동.

### 상태 관리 (Zustand)

설문 상태는 단일 스토어가 아니라 **두 개로 분리**되어 있음.

- `useAuthStore` — 인증 상태, **localStorage** 영속화 (키 `auth.session`). mock 모드에서는 모의 세션 사용.
- `useSurveyProgressStore` — 설문 진행 상태(`currentStep`, `answersByStep`, `previewResult` 등), **sessionStorage** 영속화 (키 `survey.progress`).
- `useSurveyResultStore` — 최근 결과 식별자(`latestResultId`) 등, **localStorage** 영속화 (키 `survey.result`).
- 로그인 후 복귀 인텐트는 sessionStorage(`auth.postLoginIntent`)에 별도 저장.

Zustand 셀렉터 사용 시 `useShallow`로 불필요한 리렌더링 방지.

### 타입 규칙

- 피부 타입·고민은 **대문자 코드**로 표현. `SkinType` = `'DRY' | 'OILY' | 'COMBINATION' | 'SENSITIVE' | 'UNKNOWN'`, `Concern` 코드는 `CONCERN_CODES`(`DRY/ACNE/PIGMENTATION/AGING/SENSITIVE/SEBUM/PORE`). 정의는 `src/types/domain.ts`.
- 코드 검증 타입 가드는 `src/domain/surveyCodes.ts`의 `isSkinTypeCode` / `isConcernCode`.
- 라벨 매핑은 `src/domain/surveyConfig.ts`의 `INGREDIENT_GROUP_LABELS`, `PRODUCT_CATEGORY_LABELS`.

### 레이아웃

- `AppLayout` — 최상위 래퍼, 흰색 배경(`bg-white`).
- `MobilePage` — 최대 너비 390px(`max-w-[390px]`)로 제한된 모바일 카드 레이아웃.
- 보호 라우트(`ProtectedRoute`) 적용 경로: `/results/:id`, `/results/:id/routine`, `/results/:id/products`, `/results/:id/products/search`, `/mypage`, `/mypage/results`, `/mypage/routines`, `/mypage/routines/:id`. 단, `VITE_API_MODE=mock`(기본값)에서는 인증 검사를 건너뜀 — 보호는 `live` 모드에서만 실제 적용됨.

### 경로 별칭

`@/` → `src/` (vite.config.ts에 설정)
