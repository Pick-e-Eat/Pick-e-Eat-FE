// 도메인별 API 함수를 한 곳에서 관리
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api.types";
import type { Post, PostCreate, PostListParams, PostUpdate } from "../types/post.types";

export const postsApi = {
  getAll: (params: PostListParams) =>
    apiClient.get("api/v1/posts", { searchParams: params }).json<PaginatedResponse<Post>>(),

  getById: (id: number) => apiClient.get(`api/v1/posts/${id}`).json<Post>(),

  create: (data: PostCreate) =>
    apiClient.post("api/v1/posts", { json: data }).json<Post>(),

  update: (id: number, data: PostUpdate) =>
    apiClient.patch(`api/v1/posts/${id}`, { json: data }).json<Post>(),

  remove: (id: number) => apiClient.delete(`api/v1/posts/${id}`).json<void>(),
} as const;
