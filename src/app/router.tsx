// 페이지 라우팅을 중앙에서 선언적으로 관리
import { createBrowserRouter } from "react-router-dom";
import { routes } from "@/shared/constants/routes";
import { HomePage } from "@/pages/HomePage";
import { PostCreatePage } from "@/pages/PostCreatePage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { PostListPage } from "@/pages/PostListPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const appRouter = createBrowserRouter([
  {
    path: routes.home,
    element: <HomePage />,
  },
  {
    path: routes.posts.list,
    element: <PostListPage />,
  },
  {
    path: routes.posts.create,
    element: <PostCreatePage />,
  },
  {
    path: routes.posts.detail,
    element: <PostDetailPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
