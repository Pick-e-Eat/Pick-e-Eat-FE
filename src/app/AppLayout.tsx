import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.scss";

/** 햄버거 메뉴 등 오버레이를 앱 영역 안에 뿌리기 위한 타깃 id (슬라이드가 영역 안에서만 보이도록) */
export const APP_OVERLAY_ROOT_ID = "app-overlay-root";

/**
 * 웹앱형 레이아웃: 데스크톱에서는 최대 너비로 가운데 정렬, 모바일에서는 전체 너비
 */
export function AppLayout() {
  return (
    <div className="relative mx-auto w-full min-h-dvh max-w-[560px] bg-background sm:min-h-dvh">
      <Outlet />
      <div
        id={APP_OVERLAY_ROOT_ID}
        className="pointer-events-none absolute inset-0 z-100 overflow-hidden"
        aria-hidden
      />
    </div>
  );
}
