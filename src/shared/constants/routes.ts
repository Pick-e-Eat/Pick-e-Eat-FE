// 라우트 경로를 한 곳에서 관리해 변경 비용을 줄임
export const routes = {
  home: "/",
  posts: {
    list: "/posts",
    create: "/posts/new",
    detail: "/posts/:id",
  },
} as const;
