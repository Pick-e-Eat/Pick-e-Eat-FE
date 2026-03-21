# Pick-e-Eat FE (MVP)

Feature 모듈 구조로 확장 가능한 CRUD 예제 프론트엔드입니다.  
React 19 + TypeScript 5 + Vite 6 기반이며, 상태 관리는 Zustand와 TanStack Query로 분리합니다.

## 요구사항

- Node.js 20 이상 (react-router-dom v7 권장 사양). 저장소 루트의 `.nvmrc`는 **22**를 가리킵니다.
- Yarn 4 이상

Node가 없다면 예: [Homebrew](https://brew.sh)로 `brew install node@22` 후 PATH에 추가하거나, [nvm](https://github.com/nvm-sh/nvm)으로 `nvm install` (`.nvmrc` 기준) 후 `nvm use` 하세요.

### Yarn 고정 (Corepack)

Node에 포함된 Corepack으로 Yarn 버전을 맞춥니다. 처음 한 번만 아래를 실행하세요.

```bash
corepack enable
corepack prepare yarn@4.9.4 --activate
```

Corepack이 없다면(`command not found: corepack`) Node를 최신 LTS로 재설치했는지 확인하세요.

## 빠른 시작

```bash
git clone <레포지토리_URL>
cd Pick-e-Eat-FE
corepack enable && corepack prepare yarn@4.9.4 --activate
yarn install
# .env가 없을 때만: cp .env.example .env
yarn dev
```

이 레포에는 로컬용 `.env`가 이미 있을 수 있습니다(`.gitignore`에 포함). 없다면 `cp .env.example .env`로 만드세요.

브라우저에서 `http://127.0.0.1:5173/`로 접속하세요.

## 환경 변수

`.env`에 아래 값을 설정합니다.

```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Pick-e-Eat MVP
```

## 주요 스크립트

- `yarn dev`: 개발 서버 실행
- `yarn build`: 프로덕션 빌드
- `yarn preview`: 빌드 결과 미리보기
- `yarn lint`: Biome 린트
- `yarn format`: Biome 포맷

## 프로젝트 구조

```
src/
├── app/                # 앱 설정 레이어 (router, providers)
├── components/         # Atomic UI 컴포넌트 (도메인 무관)
├── features/           # 도메인 모듈 (posts 등)
├── pages/              # 라우트 매핑 페이지
├── shared/             # 공통 유틸/타입/상수
└── styles/             # 전역 스타일
```

## 동작 흐름 요약

- 서버 상태: `features/posts/api/*` (TanStack Query)
- 클라이언트 UI 상태: `features/posts/stores/*` (Zustand)
- 도메인 컴포넌트: `features/posts/components/*`
- 페이지 조합: `pages/*` + `components/templates/*`

## 트러블슈팅

- `react-router-dom@7` 경고가 뜬다면 Node를 20 이상으로 업그레이드하세요.
- 개발 서버가 포트 충돌로 실패하면 다른 프로세스가 `5173`을 점유 중인지 확인하세요.

## 백엔드 API

- FastAPI RESTful
- 기본 엔드포인트: `/api/v1/posts`

---

필요한 옵션(Storybook/MSW/Vitest) 확장을 원하시면 알려주세요.
