// 라우터와 전역 Provider를 조합하는 앱 루트 컴포넌트
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./app/providers";
import { appRouter } from "./app/router";

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}
