# Skin Survey (Layerd Frontend)

피부 설문 단계 응답을 저장하고 마지막 단계에서 결과 API를 호출하는 React + TypeScript + Vite 프로젝트입니다.

## 핵심 기능

- 전체 라우팅 골격
  - `/`
  - `/survey`
  - `/survey/steps`
  - `/survey/result`
  - `/mypage` (보호)
  - `/routines/:id` (보호)
  - `/routines/:id/products` (보호)
  - `/products/:id`
- `zustand` 기반 설문 상태 관리 + `persist`
- 단계별 응답 저장 후 마지막 단계에서 1회 제출
- API 클라이언트 `mock/live` 전환 구조

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
- `VITE_API_BASE_URL`: live 모드 API base (기본 `/api/v1`)

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
