# Layerd — 맞춤 피부 진단 서비스

설문을 통해 사용자의 피부 타입을 진단하고, 결과에 따른 맞춤 케어 루틴을 추천하는 웹 서비스입니다.

🌐 **Website**: https://layerd.co.kr

---

## 주요 기능

- 단계별 피부 설문 진행 및 응답 저장
- 설문 완료 시 개인화된 피부 진단 결과 제공
- 진단 결과 기반 맞춤 케어 루틴 추천
- 마이페이지에서 진단 이력 및 저장한 루틴 관리
- 추천 루틴에 사용되는 제품 정보 제공
- API 클라이언트 `mock` / `live` 전환 구조

## 기술 스택

| 영역 | 기술 |
|---|---|
| Framework | React 19, TypeScript |
| Build Tool | Vite |
| Routing | React Router v7 |
| Data Fetching | TanStack Query (React Query) |
| State Management | Zustand (with persist) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Validation | Zod |
| Code Quality | ESLint, Prettier |
| Deployment | Vercel |

## 사전 요구사항

- Node.js — 저장소에 버전이 고정돼 있지 않습니다(`engines` 필드·`.nvmrc` 없음). 팀의 개발/CI 환경 버전에 맞춰 사용하세요. (LTS 권장)
- npm

## 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/swyp-3team/skin-frontend.git
cd skin-frontend

# 2. 의존성 설치
npm install

# 3. (선택) 환경 변수 설정
# .env.local 파일이 없어도 mock 모드로 동작합니다.
# live 모드 등 별도 설정이 필요하면 아래 "환경 변수" 표를 참고해 .env.local을 직접 작성하세요.

# 4. 개발 서버 실행
npm run dev
```

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 검사 + 프로덕션 빌드 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 포맷팅 |
| `npm run format:check` | 포맷 검사 (CI용) |
| `npm run preview` | 빌드 결과 미리보기 |

## 환경 변수

| 변수 | 설명 | 기본값 |
|---|---|---|
| `VITE_API_MODE` | API 모드 (`mock` 또는 `live`) | `mock` |
| `VITE_API_BASE_URL` | Live 모드 API base URL | `https://api.layerd.co.kr/api/v1` |
| `VITE_OAUTH_BASE_URL` | OAuth base URL (선택) | (미설정 시 API base 사용) |

> 로그인 쿠키가 `api.layerd.co.kr` 도메인에 저장되므로, 인증 API는 반드시 `https://api.layerd.co.kr/api/v1`로 직접 호출해야 합니다. `credentials: 'include'` 요청이 동작하려면 백엔드 CORS가 `https://layerd.co.kr` Origin과 credential 포함 요청을 허용해야 합니다. `/api/v1` 프록시 경로는 공개 API 확인에는 쓸 수 있지만 `api.layerd.co.kr` 쿠키 인증에는 적합하지 않습니다.

## 프로젝트 구조

```text
src/
├── api/         # API 클라이언트 (mock / live 전환), 계약·타입·에러
├── app/         # 앱 진입점, 라우터·레이아웃·보호 라우트
├── auth/        # OAuth 시작 URL, 로그인 인텐트, 세션 이벤트
├── components/  # 공통 UI (headers, results, ui, common, icons)
├── constants/   # 상수 (auth, storage, survey, landing)
├── content/     # 약관·개인정보 처리방침 마크다운
├── domain/      # 설문 코드·설정
├── hooks/       # 커스텀 훅
├── lib/         # env, queryClient, 유틸
├── pages/       # 라우트별 페이지 (survey, results, product, auth, home …)
├── stores/      # Zustand 스토어 (auth, surveyProgress, surveyResult)
├── types/       # 공용 타입
└── main.tsx     # 엔트리
```

## 라우팅

> 🔒 표시는 **로그인이 필요한 보호 라우트**입니다.
> 단, `VITE_API_MODE=mock`(기본값)에서는 `ProtectedRoute`가 인증 검사를 건너뛰므로, 🔒는 **`live` 모드에서만 실제로 적용**됩니다.

**공개 라우트**

| 경로 | 설명 |
|---|---|
| `/` | 홈 (HomePage) |
| `/landing` | 랜딩 페이지 |
| `/oauth2/callback` | OAuth 콜백 처리 |
| `/survey` | 설문 시작 (인트로) |
| `/survey/steps` | 설문 진행 |
| `/survey/result` | 설문 결과 (미리보기) |
| `/products/:id` | 제품 상세 |
| `/terms` | 이용약관 |
| `/privacy` | 개인정보 처리방침 |

**보호 라우트**

| 경로 | 설명 |
|---|---|
| `/results/:id` 🔒 | 진단 결과 상세 |
| `/results/:id/routine` 🔒 | 추천 루틴 |
| `/results/:id/products` 🔒 | 추천 제품 |
| `/results/:id/products/search` 🔒 | 추천 제품 검색 |
| `/mypage` 🔒 | 마이페이지 |
| `/mypage/results` 🔒 | 진단 이력 목록 |
| `/mypage/routines` 🔒 | 저장된 루틴 목록 |
| `/mypage/routines/:id` 🔒 | 저장된 루틴 상세 |

매칭되지 않는 경로(`*`)는 404(NotFoundPage)로 처리됩니다.

설문 결과(`/survey/result`)와 전체 결과(`/results/:id`)는 동일한 화면 컴포넌트를 공유하며, 미리보기 화면에는 블러 게이트만 추가됩니다.

## Live 모드 인증 정책

모든 API 요청은 `credentials: 'include'`로 쿠키를 포함하며, 다음 정책에 따라 인증을 복구합니다.

1. `401` 응답 시 `POST /api/v1/auth/refresh`로 accessToken 재발급을 **1회** 시도 (요청 본문을 안전하게 재전송할 수 없는 경우에는 재시도하지 않고 오류 처리)
2. Refresh 성공 시 원요청을 **1회** 재시도
3. Refresh 실패 시 `auth:session-expired` 이벤트를 발생시켜 인증/캐시 상태를 정리하고 랜딩 페이지(`/landing`)로 이동

## 마이페이지 상태 규칙

마이페이지는 다음 3가지 상태로 렌더링됩니다.

| 상태 | 진단 결과 | 루틴 저장 |
|---|:---:|:---:|
| `diagnosis_routine` | ✅ | ✅ |
| `diagnosis_only` | ✅ | ❌ |
| `empty` | ❌ | ❌ |

상태 판단은 마이페이지 API 응답을 기준으로 합니다.

- 진단 결과 유무: 응답의 진단 이력(`skinResults`)
- 루틴 저장 유무: 응답의 `routine` 필드 존재 여부(`data.routine != null`)

**미리보기 노출 제한**

- 진단 이력은 최대 **3건**(`MAX_VISIBLE_HISTORY_COUNT`), 루틴은 **1건**만 표시합니다.
- `전체보기` 버튼은 각각 `/mypage/results`, `/mypage/routines` 목록 페이지로 이동합니다.

## 상태 저장 키

| 키 | 저장소 | 용도 |
|---|---|---|
| `auth.session` | localStorage | 인증 세션 (Zustand persist) |
| `auth.postLoginIntent` | sessionStorage | 로그인 후 복귀 인텐트 |
| `survey.progress` | sessionStorage | 설문 진행 상태 (Zustand persist) |
| `survey.result` | localStorage | 설문 결과 (Zustand persist) |

> 참고: `survey.selectedSkinType`는 레거시 상수로 정의만 남아 있고 현재 코드에서는 사용되지 않습니다.

## AI 협업 가이드

이 저장소는 AI 코딩 에이전트와의 협업을 위한 가이드 문서를 포함합니다.

- [`CLAUDE.md`](./CLAUDE.md) — Claude 사용 가이드
- [`AGENTS.md`](./AGENTS.md) — 에이전트 워크플로 정의
- [`.claude/`](./.claude) — Claude 프로젝트 설정
- [`.agents/skills/`](./.agents/skills) — 에이전트 스킬 정의
