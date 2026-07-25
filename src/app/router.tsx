// 페이지 라우팅을 중앙에서 선언적으로 관리
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { LocationPickerPage } from "@/pages/LocationPickerPage.tsx";
import { LoginPage } from "@/pages/LoginPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SignupPage } from "@/pages/SignupPage";
import { routes } from "@/shared/constants/routes";

export const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: routes.home, element: <HomePage /> },
      { path: routes.results, element: <ResultsPage /> },
      { path: routes.locationPicker, element: <LocationPickerPage /> },
      { path: routes.auth.login, element: <LoginPage /> },
      { path: routes.auth.signup, element: <SignupPage /> },
    ],
  },
]);
