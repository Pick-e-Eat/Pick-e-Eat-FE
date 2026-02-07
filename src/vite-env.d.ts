/// <reference types="vite/client" />
// Vite의 환경 변수 타입을 명시해 DX를 개선
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
