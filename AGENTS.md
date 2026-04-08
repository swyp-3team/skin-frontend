# AGENTS.md

## Project Overview

- 이 저장소는 피부 타입 단일 선택 설문을 제공하는 React + TypeScript + Vite 프로젝트입니다.
- 현재 엔트리포인트는 `src/main.tsx`이며, `SurveyPage` 단일 화면을 렌더링합니다.
- 주요 기술 스택:
  - React 19
  - TypeScript (strict 모드)
  - Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite` 플러그인 사용)
- 설문 선택값은 `localStorage` 키 `survey.selectedSkinType`에 저장/복원됩니다.

## Architecture and Design Patterns

- 앱 구조는 `main.tsx` → `SurveyPage.tsx`의 단일 화면(SPA) 진입 구조를 유지합니다.
- 화면 상태는 컴포넌트 로컬 상태(`useState`)로 관리하고, 전역 상태 라이브러리는 도입하지 않습니다.
- 영속화가 필요한 값은 `localStorage`에 저장하되, 저장/복원 키는 상수(`STORAGE_KEY` 패턴)로 관리합니다.
- 저장소에서 읽은 값은 타입 가드로 검증한 뒤 상태에 반영합니다.
- 스타일은 Tailwind 유틸리티와 `src/index.css`의 `@theme` 토큰을 함께 사용합니다.

## Repository Layout

- `src/main.tsx`: 앱 엔트리포인트
- `src/SurveyPage.tsx`: 설문 UI/상태 로직
- `src/index.css`: Tailwind import 및 테마 토큰/기본 스타일
- `public/`: 정적 리소스
- `dist/`: 빌드 산출물 (커밋 대상 아님)

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

- 현재 커버리지 품질 게이트는 없습니다. 테스트 러너 도입 전까지는 `lint` + `build`를 필수 게이트로 사용합니다.
- 특정 테스트만 실행하는 명령은 없습니다(테스트 러너 미구성).
- 테스트 러너 도입 시 `npm test` 스크립트, 단일 테스트 실행 명령, 최소 커버리지 기준을 본 섹션에 즉시 추가합니다.

## Code Style Guidelines

기본 원칙:

- TypeScript strict 설정을 유지합니다 (`tsconfig.app.json`, `tsconfig.node.json`).
- ESLint 규칙을 단일 기준으로 따릅니다 (`eslint.config.js`).
- React 함수형 컴포넌트 + 훅 패턴을 사용합니다.

구체 규칙:

- 불필요한 미사용 변수/파라미터를 남기지 않습니다.
- import는 외부 패키지 → 로컬 모듈 순서를 유지합니다.
- Tailwind 스타일 토큰은 `src/index.css`의 `@theme` 변수 사용을 우선합니다.
- 상태 영속화 키는 상수로 관리하고(`STORAGE_KEY` 패턴), 문자열 하드코딩 중복을 피합니다.

## Build and Deployment

- 빌드 명령: `npm run build`
- 빌드 출력 디렉터리: `dist/`
- 현재 저장소에는 배포 스크립트/플랫폼별 배포 설정 파일이 없습니다.
- CI/CD 워크플로우(`.github/workflows`)가 없어, 로컬 검증(`lint`, `build`)이 기본 품질 게이트입니다.

## Security Considerations

- 비밀값(토큰/키/인증정보)은 코드나 저장소에 커밋하지 않습니다.
- 환경변수를 도입할 경우 Vite 규칙(`VITE_` 접두사)을 따릅니다.
- 현재 `localStorage`에는 민감정보가 아닌 설문 선택값만 저장합니다.

## Pull Request Guidelines

- PR 제목 형식 권장: `[skin-web] 변경 요약`
- PR 전 필수 실행:
  - `npm run lint`
  - `npm run build`
- UI 변경 시 변경 전/후 스크린샷 또는 확인 절차를 PR 설명에 포함합니다.
- 한 PR에는 하나의 목적(기능/수정)에 집중합니다.

## Debugging and Troubleshooting

- 개발 서버 문제 시:
  1. `node_modules`가 손상되었는지 확인
  2. `npm install` 재실행
- 타입 빌드 캐시 이슈 시:
  - `node_modules/.tmp` 캐시 파일 확인 후 `npm run build` 재실행
- 스타일 반영 문제 시:
  - `src/index.css`의 `@import "tailwindcss";` 존재 여부
  - `vite.config.ts`의 `tailwindcss()` 플러그인 설정 여부 확인

## Monorepo Notes

- 현재는 단일 패키지 저장소입니다.
- 하위 패키지/앱으로 분리될 경우 각 하위 루트에 별도 `AGENTS.md`를 추가하세요.
