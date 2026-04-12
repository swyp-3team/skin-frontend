# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # 개발 서버 실행 (Vite)
npm run build        # 타입 체크 후 프로덕션 빌드
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
| `VITE_API_BASE_URL` | `/api/v1` | live 모드에서 사용할 API 베이스 URL |

기본값은 `mock`이므로 `.env` 파일 없이도 앱이 동작함.

## 아키텍처 개요

**스킨케어 설문 & 루틴 추천 앱.** 사용자가 설문을 완료하면 피부 타입과 고민에 맞는 성분 그룹 및 제품 루틴을 추천함.

### 설문 흐름

설문은 3단계로 구성됨 (`SurveyStepsPage`):

1. 질문 단계 — API에서 불러온 질문들 (현재 4개), 각 문항에 5점 척도로 응답
2. 피부 타입 선택 — `SkinTypeSelection` (소문자: `dry/oily/combination/sensitive`)
3. 고민 선택 — `Concern` 복수 선택 (대문자: `DRY/SEBUM/ACNE/SENSITIVE/PIGMENTATION/AGING`)

`currentStep`이 `questions.length + 1`이면 피부 타입 단계, `questions.length + 2`이면 고민 단계.

### 결과 분기 (인증 여부)

- **비로그인** → `submitSurveyPreview()` → `PreviewResult` (피부 타입 요약 + Top3 성분 그룹)
- **로그인** → `submitSurveyResult()` → `FullResult` (PreviewResult + 추천 제품 + 루틴 가이드)

`SurveyResultPage`에서 `lastResult`가 `FullResult`인지 타입 가드(`guards.ts`)로 판별해 분기 렌더링.

### API 클라이언트 패턴

`src/api/index.ts`에서 `VITE_API_MODE` 환경 변수로 `mockApiClient` / `liveApiClient`를 선택해 `apiClient` 싱글턴으로 내보냄. 모든 API 호출은 이 `apiClient`를 통해 이루어짐. 인터페이스는 `src/api/client.ts`의 `ApiClient`.

### 상태 관리 (Zustand)

- `useAuthStore` — 인증 상태, localStorage에 영속화. 현재 mock 로그인/로그아웃만 구현.
- `useSurveyStore` — 설문 진행 상태 전체, localStorage에 영속화 (답변·피부타입·고민·현재 스텝).

Zustand 셀렉터 사용 시 `useShallow`로 불필요한 리렌더링 방지.

### 타입 규칙

- `SkinTypeSelection` (소문자) — UI/store에서 사용하는 내부 표현
- `SkinType` (대문자) — API 페이로드에서 사용하는 백엔드 표현
- `SELECTION_TO_API_SKIN_TYPE` 맵으로 변환 (`src/domain/surveyConfig.ts`)

### 레이아웃

- `AppLayout` — 최상위 래퍼, 회색 배경
- `MobilePage` — 최대 너비 390px로 제한된 모바일 카드 레이아웃. 모든 페이지에서 사용.
- 보호 라우트(`ProtectedRoute`)는 `/mypage`, `/routines/:id`, `/routines/:id/products`에 적용

### 경로 별칭

`@/` → `src/` (vite.config.ts에 설정)
