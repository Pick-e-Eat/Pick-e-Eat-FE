import { Outlet } from "react-router-dom";

/**
 * 웹앱형 레이아웃: 데스크톱에서는 최대 너비로 가운데 정렬, 모바일에서는 전체 너비
 */
export function AppLayout() {
  return (
    <div className="mx-auto w-full min-h-dvh max-w-[560px] bg-background sm:min-h-dvh">
      <Outlet />
    </div>
  );
}
