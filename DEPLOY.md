# Vercel 배포 가이드 (Pick-e-Eat-FE)

> Vite + React 19 SPA를 Vercel에 배포한다. 백엔드(Cloud Run)와 **배포 순서가 얽혀 있으니** §3을 먼저 읽을 것.

---

## 1. 준비 상태 (체크 완료)

| 항목 | 상태 |
|---|---|
| 빌드 | `yarn build` → `dist/` 생성 확인 |
| SPA 라우팅 | `vercel.json` rewrites 로 모든 경로 → `/index.html` (새로고침/직접진입 404 방지) |
| 패키지 매니저 | Yarn 4.9.4 (`packageManager` 필드 + `yarn.lock` 커밋됨 → Vercel 자동 인식) |
| Node | `.nvmrc=22`, `engines.node>=20` |
| 비밀값 | `.env` 는 gitignore. Vercel 대시보드 환경변수로 주입 |

## 2. 환경변수 (Vercel 대시보드 → Settings → Environment Variables)

Vite는 빌드 시점에 `VITE_*` 변수를 번들에 **박아 넣는다**. 따라서 값 변경 후에는 **재배포(redeploy)** 가 필요하다.

| 키 | 값 | 비고 |
|---|---|---|
| `VITE_API_BASE_URL` | `https://<cloud-run-url>` | **끝에 `/` 없이.** BE 배포 후 확정되는 Cloud Run URL (§3) |
| `VITE_GOOGLE_MAPS_API_KEY` | (Google Maps JS API 키) | 클라이언트 노출됨 → **반드시 HTTP 리퍼러 제한** (§4) |
| `VITE_GOOGLE_MAPS_MAP_ID` | (Map ID 또는 `DEMO_MAP_ID`) | Advanced Marker 용 |
| `VITE_APP_TITLE` | `Pick-e-Eat` | 선택 |

> Production / Preview / Development 환경별로 따로 설정 가능. 최소 **Production** 에 위 값을 넣는다.

## 3. 배포 순서 (BE ↔ FE 상호 의존)

FE는 BE URL이 필요하고(`VITE_API_BASE_URL`), BE는 FE origin이 CORS 허용 목록에 필요하다(`FRONTEND_URLS`). 순서:

1. **BE 먼저 배포** → Cloud Run URL 확보 (`https://pick-e-eat-be-xxxx.a.run.app`). → BE repo `docs/cloud-run-deploy.md`
2. 그 URL을 FE `VITE_API_BASE_URL` 에 넣고 **FE 배포** → Vercel URL 확보 (`https://<project>.vercel.app`).
3. **BE 재배포** 시 `FRONTEND_URLS` 에 Vercel 프로덕션 URL 추가:
   ```bash
   FRONTEND_URLS='["https://<project>.vercel.app"]' ./scripts/deploy-cloud-run.sh
   ```
4. FE에서 실제 호출이 통과하는지(CORS/네트워크 탭) 확인.

> Vercel 프리뷰 배포는 매번 URL이 바뀌어 CORS에 막힌다. 프리뷰까지 API를 붙이려면 BE `FRONTEND_URLS` 에 프리뷰 도메인도 넣거나, 커스텀 도메인을 고정해 쓴다. MVP는 프로덕션 도메인 1개면 충분.

## 4. 배포 방법

### 방법 A — GitHub 연동 (권장)
1. [vercel.com](https://vercel.com) → New Project → 이 repo import.
2. Framework 가 **Vite** 로 자동 감지됨 (Build `yarn build`, Output `dist` — `vercel.json` 에도 명시됨).
3. §2 환경변수 입력 → Deploy.
4. 이후 `main`(또는 연결 브랜치) push 시 자동 배포.

### 방법 B — Vercel CLI
```bash
npm i -g vercel        # 최초 1회
vercel login
vercel                 # 프리뷰 배포 (대화형으로 프로젝트 연결)
vercel --prod          # 프로덕션 배포
```
환경변수는 대시보드 또는 `vercel env add VITE_API_BASE_URL production` 로 등록.

## 5. 보안 / 운영 메모

- **Google Maps 키 노출**: `VITE_GOOGLE_MAPS_API_KEY` 는 빌드 결과물(JS)에 그대로 포함되어 브라우저에서 보인다(클라이언트 키라 불가피). 반드시 Google Cloud Console → 사용자 인증 정보 → 해당 키 → **애플리케이션 제한: HTTP 리퍼러** 에 `https://<project>.vercel.app/*` (및 커스텀 도메인)만 허용하고, **API 제한**으로 Maps JavaScript API 등 필요한 것만 켠다. 현재 `.env` 에 들어있는 키는 git에 커밋되진 않았지만 노출 위험이 있으니 리퍼러 제한을 꼭 걸 것.
- **번들 크기**: 현재 JS 청크 ~637kB(gzip ~202kB). 동작엔 문제없으나, 추후 라우트 단위 `import()` 코드 스플리팅으로 개선 여지.
- **SPA fallback 동작 확인**: 배포 후 `https://<도메인>/results` 로 **직접 진입**해 200 으로 앱이 뜨는지 확인(404면 `vercel.json` rewrites 누락).
