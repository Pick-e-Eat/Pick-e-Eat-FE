// GA4(gtag) 로딩과 이벤트 전송을 한 곳에서 관리
//
// 측정 ID는 .env의 VITE_GA_MEASUREMENT_ID에서만 주입한다. 값이 없으면 스크립트를 아예 붙이지 않으므로
// 로컬/프리뷰에서 실데이터가 섞이지 않는다. (배포 환경에만 값을 넣으면 그대로 동작)
import type { AnalyticsEventName } from "@/shared/constants/analytics-events";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4가 처리할 수 있는 파라미터 값 (중첩 객체·배열은 전송되지 않음) */
type AnalyticsParams = Record<string, string | number | boolean | undefined>;

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const GA_SCRIPT_ID = "pick-e-eat-ga4";

/** 측정 ID가 주입된 환경에서만 수집한다 */
export const isAnalyticsEnabled = Boolean(measurementId);

export function initAnalytics(): void {
  if (!measurementId || typeof window === "undefined") return;
  if (document.getElementById(GA_SCRIPT_ID)) return;

  window.dataLayer = window.dataLayer || [];
  // 스크립트 로드 전에 호출된 커맨드도 dataLayer에 큐잉되어 로드 직후 순서대로 처리된다.
  window.gtag = function gtag() {
    // biome-ignore lint/complexity/noArguments: gtag.js 공식 스니펫이 arguments 객체를 그대로 요구함
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    // SPA라 라우트 변경마다 usePageViewTracking이 직접 보낸다 (GA 향상된 측정도 꺼둔 상태)
    send_page_view: false,
    // debug_mode는 false를 넘겨도 디버그 모드가 켜진다(GA 공식 문서) — 개발 환경에서만 키 자체를 넣는다.
    // 프로덕션에 붙으면 전체 트래픽이 개발자 트래픽으로 분류되어 필터에 걸린다.
    ...(import.meta.env.DEV && { debug_mode: true }),
  });

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function trackPageView(pageTitle: string): void {
  const pageParams = { page_title: pageTitle, page_location: window.location.href };
  // page_view에만 제목을 붙이면 user_engagement·커스텀 이벤트는 document.title("Pick-e-Eat")로 잡혀
  // 페이지 리포트에서 조회수와 참여 시간이 서로 다른 행으로 갈라진다 — set으로 이후 이벤트 전체에 싣는다.
  window.gtag?.("set", pageParams);
  window.gtag?.("event", "page_view", pageParams);
}

export function trackEvent(name: AnalyticsEventName, params?: AnalyticsParams): void {
  window.gtag?.("event", name, params);
}
