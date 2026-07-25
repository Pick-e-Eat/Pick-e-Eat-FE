/**
 * 위치 권한 상태 조회 + "사용자가 현재 위치 사용에 동의한 적 있는지" 기록.
 *
 * 브라우저 권한은 한 번 거부되면 코드로 다시 요청할 수 없으므로,
 * 미결정(prompt) 상태에서만 사전 안내를 띄우기 위해 상태를 먼저 확인합니다.
 */

/** "unknown": Permissions API 미지원(구형 Safari 등)으로 상태를 알 수 없음 */
export type LocationPermissionState = "granted" | "denied" | "prompt" | "unknown";

/** 사전 안내에서 사용자가 동의한 적 있음 — Permissions API가 없는 브라우저에서 안내 반복을 막는 용도 */
const LOCATION_CONSENT_KEY = "pick-e-eat:location-consent";

export async function readLocationPermissionState(): Promise<LocationPermissionState> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    if (result.state === "granted" || result.state === "denied" || result.state === "prompt") {
      return result.state;
    }
    return "unknown";
  } catch (error) {
    // geolocation 이름을 지원하지 않는 브라우저는 TypeError를 던짐
    console.error("Failed to read geolocation permission state:", error);
    return "unknown";
  }
}

export function storeLocationConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCATION_CONSENT_KEY, "1");
  } catch (error) {
    console.error("Failed to persist location consent:", error);
  }
}

export function hasStoredLocationConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LOCATION_CONSENT_KEY) === "1";
  } catch (error) {
    console.error("Failed to read location consent:", error);
    return false;
  }
}
