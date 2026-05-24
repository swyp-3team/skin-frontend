# AGENTS.md

## Project Overview

- 이 저장소는 피부 설문 기반 추천을 위한 React + TypeScript + Vite 프로젝트입니다.
- 엔트리포인트는 `src/main.tsx`이며, `src/app/router.tsx`에서 라우팅을 구성합니다.
- 현재 주요 라우트:
  - `/` (로그인 + 최근 진단 결과 사용자용 홈)
  - `/landing` (랜딩 페이지)
  - `/oauth2/callback` (OAuth 콜백 처리)
  - `/survey`
  - `/survey/steps`
  - `/survey/result`
  - `/products/:id`
  - `/terms`
  - `/privacy`
  - `/results/:id` (보호 라우트)
  - `/results/:id/routine` (보호 라우트)
  - `/results/:id/products` (보호 라우트)
  - `/results/:id/products/search` (보호 라우트)
  - `/mypage` (보호 라우트)
  - `/mypage/results` (보호 라우트)
  - `/mypage/routines` (보호 라우트)
  - `/mypage/routines/:id` (보호 라우트)
- 설문은 단계형 UI이며, 마지막 단계에서만 결과 API를 호출합니다.

## Architecture and Design Patterns

- 앱 구조: `main.tsx` → `app/router.tsx` → `pages/*`.
- 공통 레이아웃은 `app/AppLayout.tsx`에서 관리합니다 (흰색 배경 `bg-white`).
- 보호 라우트는 `app/ProtectedRoute.tsx`에서 인증 상태(`authStore`) 기준으로 처리합니다. 단, `VITE_API_MODE=mock`(기본값)에서는 인증 검사를 건너뛰며, 보호는 `live` 모드에서만 실제 적용됩니다. 미인증 시 `/landing`으로 이동합니다.
- 상태 관리는 `zustand`를 사용하며, 설문 상태는 **두 스토어로 분리**되어 있습니다.
  - `useAuthStore`: 인증 세션
  - `useSurveyProgressStore`: 설문 진행 상태(`currentStep`, `answersByStep`, `previewResult` 등)
  - `useSurveyResultStore`: 최근 결과 식별자(`latestResultId`) 등
- 영속화는 `zustand persist` 등으로 처리합니다.
  - `auth.session` (localStorage) — 인증 세션
  - `auth.postLoginIntent` (sessionStorage) — 로그인 후 복귀 인텐트
  - `survey.progress` (sessionStorage) — 설문 진행 상태
  - `survey.result` (localStorage) — 설문 결과
  - `survey.selectedSkinType` — 레거시 상수(정의만 있고 현재 미사용)
- API 계층은 인터페이스 기반으로 분리합니다.
  - `api/client.ts` 인터페이스(`ApiClient`)
  - `api/mockClient.ts`(`mockApiClient`), `api/liveClient.ts`(`createLiveApiClient(baseUrl)`)
  - `api/index.ts`에서 `VITE_API_MODE` 기반 선택 후 `apiClient` 싱글턴으로 내보냄
  - live 모드 인증 복구:
    - 모든 API 요청은 `credentials: 'include'`를 사용합니다.
    - `401` 응답 시 `POST /api/v1/auth/refresh`를 1회 호출해 accessToken 재발급을 시도합니다 (본문을 안전하게 재전송할 수 없으면 재시도하지 않음).
    - 재발급 성공 시 원요청을 1회 재시도합니다.
    - 재발급 실패 시 `auth:session-expired` 이벤트로 인증/캐시 상태를 정리하고 `/landing`으로 이동합니다.
- 설문 결과 페이지(`/survey/result`)와 전체 결과 페이지(`/results/:id`)는 공통 결과 화면 컴포넌트를 공유합니다.
  - 미리보기는 `resultOverviewViewModel`의 `fromPreviewResult`로 렌더링하며, 상단 데이터만 실제값을 사용하고 하단 섹션은 블러 게이트로 로그인 전 노출을 제한합니다.
  - 미리보기 화면에서 로그인하면 `useLoginAndPromote`의 `promoteToFullResult`로 전체 결과로 승격합니다.
  - 결과/미리보기 화면은 `MobilePage`의 `max-w-[390px]` 기준 폭을 따릅니다.
- 마이페이지는 상태 기반 렌더링을 사용합니다 (판단 기준은 마이페이지 API 응답).
  - `diagnosis_routine`: 진단 결과 O + 루틴 저장 O
  - `diagnosis_only`: 진단 결과 O + 루틴 저장 X
  - `empty`: 진단 결과 X + 루틴 저장 X
  - 미리보기는 진단 이력 최대 3건(`MAX_VISIBLE_HISTORY_COUNT`), 루틴 1건만 노출합니다.
  - `전체보기`는 각각 `/mypage/results`, `/mypage/routines` 페이지로 이동합니다.

## Repository Layout

- `src/main.tsx`: 앱 엔트리
- `src/app/`: 라우팅, 레이아웃, 보호 라우트, 경로 상수(`routes.ts`)
- `src/pages/`: URL 단위 페이지 컴포넌트 (`survey/`, `results/`, `product/`, `auth/`, `home/` 등). 단계형 설문 UI는 `src/pages/survey/steps/SurveyStepsPage.tsx`
- `src/stores/`: zustand 스토어 (`authStore`, `surveyProgressStore`, `surveyResultStore`)
- `src/api/`: API 클라이언트/타입/에러
- `src/auth/`: OAuth 시작 URL, 로그인 인텐트, 세션 이벤트
- `src/domain/`: 설문 코드(`surveyCodes.ts`)·라벨 설정(`surveyConfig.ts`)
- `src/constants/`: 상수 (`storage.ts`, `survey.ts` 등)
- `src/components/`: 공통 UI 컴포넌트
- `src/hooks/`, `src/lib/`: 커스텀 훅, 유틸(`env.ts`, `queryClient.ts` 등)
- `src/content/`: 약관·개인정보 처리방침 마크다운
- `src/types/`: 도메인 타입
- `src/index.css`: Tailwind import 및 테마 토큰

## Setup Commands

사전 요구사항:

- Node.js LTS (저장소에 `engines`·`.nvmrc`로 버전이 고정돼 있지 않으므로 팀 환경 버전에 맞춰 사용)
- npm (이 프로젝트는 `package-lock.json` 기반 npm 사용)

초기 설정 및 실행:

- 의존성 설치: `npm install`
- 개발 서버 실행: `npm run dev`
- 프로덕션 빌드: `npm run build`
- 빌드 결과 미리보기: `npm run preview`
- 린트 실행: `npm run lint`
- 포맷팅: `npm run format` / 포맷 검사: `npm run format:check`

## Development Workflow

일반 개발 순서:

1. `npm install`
2. `npm run dev`
3. `src/` 하위 코드 수정
4. 커밋 전 아래 검증 실행:
   - `npm run lint`
   - `npm run build`

작업 규칙:

- 패키지 매니저는 npm만 사용합니다.
- 빌드 산출물(`dist/`)은 직접 수정하지 않습니다.
- 주요 로직 변경 시 `README.md`와 본 문서(`AGENTS.md`)를 함께 갱신합니다.

## Testing Instructions

현재 상태:

- 자동화 테스트 러너(Vitest/Jest 등) 및 `npm test` 스크립트가 구성되어 있지 않습니다.
- `src/` 내 `*.test.*` / `*.spec.*` 테스트 파일이 없습니다.

현재 필수 검증 절차:

- 정적 분석: `npm run lint`
- 타입 검사 + 프로덕션 번들 검증: `npm run build`

테스트 관련 참고:

- 현재 커버리지 품질 게이트는 없습니다.
- 테스트 러너 도입 시 `npm test` 스크립트, 단일 테스트 실행 명령, 최소 커버리지 기준을 본 섹션에 즉시 추가합니다.

## Code Style Guidelines

기본 원칙:

- TypeScript strict 설정을 유지합니다 (`tsconfig.json`, `tsconfig.node.json`).
- ESLint 규칙을 단일 기준으로 따릅니다 (`eslint.config.js`).
- React 함수형 컴포넌트 + 훅 패턴을 사용합니다.

구체 규칙:

- 불필요한 미사용 변수/파라미터를 남기지 않습니다.
- import 순서는 외부 패키지 → 로컬 모듈을 유지합니다.
- 라우트 문자열 하드코딩을 피하고 `src/app/routes.ts`를 사용합니다.
- 설문 제출 payload는 질문 배열 순서가 아닌 각 문항의 `step` 값 기준으로 생성합니다.
- 에러 처리는 `ApiError`로 정규화합니다.

## Build and Deployment

- 빌드 명령: `npm run build`
- 빌드 출력 디렉터리: `dist/`
- 배포는 Vercel을 사용합니다 (`vercel.json`, `.vercel/`).
- CI/CD 워크플로우(`.github/workflows`)는 없어, 로컬 검증(`lint`, `build`)이 기본 품질 게이트입니다.

## Security Considerations

- 비밀값(토큰/키/인증정보)은 코드나 저장소에 커밋하지 않습니다.
- 환경변수는 Vite 규칙(`VITE_` 접두사)을 따릅니다.
- 브라우저 저장소에는 인증 세션/설문 상태만 보관합니다.

## Pull Request Guidelines

- PR 제목 형식 권장: `[skin-web] 변경 요약`
- PR 전 필수 실행:
  - `npm run lint`
  - `npm run build`
- UI 변경 시 변경 전/후 스크린샷 또는 확인 절차를 PR 설명에 포함합니다.
- 한 PR에는 하나의 목적(기능/수정)에 집중합니다.

## Debugging and Troubleshooting

- 개발 서버 문제 시:
  1. `node_modules` 상태 확인
  2. `npm install` 재실행
- 타입 빌드 캐시 이슈 시:
  - `npm run build` 재실행
- API 연동 점검 시:
  - `VITE_API_MODE`, `VITE_API_BASE_URL`(필요 시 `VITE_OAUTH_BASE_URL`) 값 확인
- 마이페이지 상태가 맞지 않을 때:
  - 마이페이지 API 응답(`skinResults`, `routine`)이 기대대로 오는지 확인
  - 결과 조회 `401/404` 시 인증/캐시 상태가 정리되는지 확인

## Monorepo Notes

- 현재는 단일 패키지 저장소입니다.
- 하위 패키지/앱으로 분리될 경우 각 하위 루트에 별도 `AGENTS.md`를 추가하세요.
