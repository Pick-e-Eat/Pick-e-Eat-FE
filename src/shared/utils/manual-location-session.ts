/**
 * "이번 앱 세션에서 사용자가 위치를 직접 지정했는지" 표시.
 *
 * sessionStorage를 쓰는 이유:
 * - 새로고침(F5)에서는 유지 → 사용자가 고른 위치를 그대로 씀
 * - 탭을 닫고 다시 열거나 새 탭/PWA로 새로 진입하면 비워짐 → 다시 현재 위치를 검색
 */
const MANUAL_LOCATION_SESSION_KEY = "pick-e-eat:manual-location-selected";

export function markManualLocationSelected(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MANUAL_LOCATION_SESSION_KEY, "1");
  } catch (error) {
    // 시크릿 모드 등 sessionStorage 접근이 막힌 환경 — 지정 위치 유지만 포기하고 동작은 계속
    console.error("Failed to persist manual location marker:", error);
  }
}

export function hasManualLocationInSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(MANUAL_LOCATION_SESSION_KEY) === "1";
  } catch (error) {
    console.error("Failed to read manual location marker:", error);
    return false;
  }
}
