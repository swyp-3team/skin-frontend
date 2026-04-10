# AGENTS.md

## Project Overview

- 이 저장소는 피부 설문 기반 추천을 위한 React + TypeScript + Vite 프로젝트입니다.
- 엔트리포인트는 `src/main.tsx`이며, `src/app/router.tsx`에서 라우팅을 구성합니다.
- 현재 주요 라우트:
  - `/`
  - `/survey`
  - `/survey/steps`
  - `/survey/result`
  - `/mypage` (보호 라우트)
  - `/routines/:id` (보호 라우트)
  - `/routines/:id/products` (보호 라우트)
  - `/products/:id`
- 설문은 단계형 UI이며, 마지막 단계에서만 결과 API를 호출합니다.

## Architecture and Design Patterns

- 앱 구조: `main.tsx` → `app/router.tsx` → `pages/*`.
- 공통 레이아웃은 `app/AppLayout.tsx`에서 관리합니다.
- 보호 라우트는 `app/ProtectedRoute.tsx`에서 모의 인증 상태(`authStore`) 기준으로 처리합니다.
- 상태 관리는 `zustand`를 사용합니다.
  - `surveyStore`: 설문 단계/응답/피부타입/고민/제출 상태
  - `authStore`: 모의 로그인 세션
- 영속화는 `zustand persist`로 처리합니다.
  - 레거시 키: `survey.selectedSkinType`
  - 설문 세션 키: `survey.session`
  - 인증 세션 키: `auth.mockSession`
- API 계층은 인터페이스 기반으로 분리합니다.
  - `api/client.ts` 인터페이스
  - `api/mockClient.ts`, `api/liveClient.ts`
  - `api/index.ts`에서 `VITE_API_MODE` 기반 선택

## Repository Layout

- `src/main.tsx`: 앱 엔트리
- `src/app/`: 라우팅, 레이아웃, 보호 라우트, 경로 상수
- `src/pages/`: URL 단위 페이지 컴포넌트
- `src/stores/`: zustand 스토어
- `src/api/`: API 클라이언트/타입/에러
- `src/types/`: 도메인 타입
- `src/SurveyPage.tsx`: 단계형 설문 UI
- `src/index.css`: Tailwind import 및 테마 토큰

## Setup Commands

사전 요구사항:

- Node.js LTS (권장: 최신 LTS)
- npm (이 프로젝트는 `package-lock.json` 기반 npm 사용)

초기 설정 및 실행:

- 의존성 설치: `npm install`
- 개발 서버 실행: `npm run dev`
- 프로덕션 빌드: `npm run build`
- 빌드 결과 미리보기: `npm run preview`
- 린트 실행: `npm run lint`

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
- `AGENTS.md`를 수정했다면 호환 파일 `AGENT.md`도 동일 내용으로 동기화합니다.

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

- TypeScript strict 설정을 유지합니다 (`tsconfig.app.json`, `tsconfig.node.json`).
- ESLint 규칙을 단일 기준으로 따릅니다 (`eslint.config.js`).
- React 함수형 컴포넌트 + 훅 패턴을 사용합니다.

구체 규칙:

- 불필요한 미사용 변수/파라미터를 남기지 않습니다.
- import 순서는 외부 패키지 → 로컬 모듈을 유지합니다.
- 라우트 문자열 하드코딩을 피하고 `src/app/routes.ts`를 사용합니다.
- 설문 제출 payload는 질문 순서가 아닌 `questionId` 기준으로 생성합니다.
- 에러 처리는 `ApiError`로 정규화합니다.

## Build and Deployment

- 빌드 명령: `npm run build`
- 빌드 출력 디렉터리: `dist/`
- 현재 저장소에는 배포 스크립트/플랫폼별 배포 설정 파일이 없습니다.
- CI/CD 워크플로우(`.github/workflows`)가 없어, 로컬 검증(`lint`, `build`)이 기본 품질 게이트입니다.

## Security Considerations

- 비밀값(토큰/키/인증정보)은 코드나 저장소에 커밋하지 않습니다.
- 환경변수를 도입할 경우 Vite 규칙(`VITE_` 접두사)을 따릅니다.
- 로컬 저장소에는 설문 상태/모의 인증 정보만 저장합니다.

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
  - `node_modules/.tmp` 캐시 확인 후 `npm run build` 재실행
- API 연동 점검 시:
  - `VITE_API_MODE`, `VITE_API_BASE_URL` 값 확인

## Monorepo Notes

- 현재는 단일 패키지 저장소입니다.
- 하위 패키지/앱으로 분리될 경우 각 하위 루트에 별도 `AGENTS.md`를 추가하세요.
