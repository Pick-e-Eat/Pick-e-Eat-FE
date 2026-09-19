// SPA 라우트 변경을 GA4 page_view로 전송 (RouterProvider 내부에서만 호출 가능)
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { routes } from "@/shared/constants/routes";
import { trackPageView } from "@/shared/utils/analytics";

/** 라우트별 page_title — document.title은 건드리지 않고 GA 리포트 가독성만 올린다 */
const pageTitleByPath: Record<string, string> = {
  [routes.home]: "홈 (스와이프)",
  [routes.results]: "검색 결과",
  [routes.locationPicker]: "위치 설정",
  [routes.auth.login]: "로그인",
  [routes.auth.signup]: "회원가입",
};

export function usePageViewTracking(): void {
  const { pathname } = useLocation();

  // pathname만 의존 — state만 비우는 replace 내비게이션에서는 중복 전송되지 않는다.
  useEffect(() => {
    trackPageView(pageTitleByPath[pathname] ?? pathname);
  }, [pathname]);
}
