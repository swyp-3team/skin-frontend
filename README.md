# Skin Survey

피부 타입 설문을 단계적으로 확장하기 위한 React + TypeScript + Vite 프로젝트입니다.

## 특징

- 단일 설문 페이지 중심의 단순한 구조
- `localStorage`를 사용하는 단일 선택 설문 상태 복원
- 가벼운 TypeScript ESLint 설정

## 시작하기

```bash
npm install
npm run dev
```

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 타입 검사 후 프로덕션 번들 생성
- `npm run lint`: ESLint 실행
- `npm run preview`: 빌드 결과 미리보기

## 현재 구조

```text
src/
  SurveyPage.tsx
```

## 다음 확장 포인트

- 멀티스텝 질문 추가
- 결과 화면 및 추천 로직 연결
- 응답 저장소를 서버 API로 확장
