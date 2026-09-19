import { Outlet } from "react-router-dom";
import { usePageViewTracking } from "@/shared/hooks/usePageViewTracking";
import styles from "./AppLayout.module.css";

/** 햄버거 메뉴 등 오버레이를 앱 영역 안에 뿌리기 위한 타깃 id (슬라이드가 영역 안에서만 보이도록) */
export const APP_OVERLAY_ROOT_ID = "app-overlay-root";

/**
 * 웹앱형 레이아웃: 데스크톱에서는 최대 너비로 가운데 정렬, 모바일에서는 전체 너비
 */
export function AppLayout() {
  // useLocation은 RouterProvider 내부에서만 동작하므로 레이아웃에서 호출한다
  usePageViewTracking();

  return (
    <div className={styles.mainContainer}>
      <Outlet />
      <div id={APP_OVERLAY_ROOT_ID} className={styles.overlayRoot} aria-hidden />
    </div>
  );
}
