// 페이지 라우팅을 중앙에서 선언적으로 관리
import { createBrowserRouter } from "react-router-dom";
import { routes } from "@/shared/constants/routes";
import { AppLayout } from "@/app/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { ResultsPage } from "@/pages/ResultsPage";

export const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: routes.home, element: <HomePage /> },
      { path: routes.results, element: <ResultsPage /> },
      { path: routes.auth.login, element: <LoginPage /> },
      { path: routes.auth.signup, element: <SignupPage /> },
    ],
  },
]);
