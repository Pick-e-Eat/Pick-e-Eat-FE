// 공통 HTTP 클라이언트로 인증/에러 처리를 한 곳에 모음
import ky from "ky";

const CLIENT_ID_STORAGE_KEY = "pick_client_id";

export function getOrCreateClientId(): string {
  let clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
  }
  return clientId;
}

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        // 익명 클라이언트 식별 헤더 주입
        const clientId = getOrCreateClientId();
        request.headers.set("X-Client-Id", clientId);
        request.headers.set("X-Platform", "web");
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        // 서버에서 갱신/보장된 X-Client-Id 가 있으면 동기화
        const serverClientId = response.headers.get("x-client-id");
        if (serverClientId && serverClientId !== localStorage.getItem(CLIENT_ID_STORAGE_KEY)) {
          localStorage.setItem(CLIENT_ID_STORAGE_KEY, serverClientId);
        }
      },
    ],
  },
});
