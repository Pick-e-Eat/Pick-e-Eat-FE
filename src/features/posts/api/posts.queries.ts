// 서버 상태는 TanStack Query 훅으로 캡슐화
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/query-client";
import type { PostListParams } from "../types/post.types";
import { postsApi } from "./posts.api";

export const postsQueryKeys = {
  all: ["posts"] as const,
  list: (params: PostListParams) => ["posts", "list", params] as const,
  detail: (id: number) => ["posts", "detail", id] as const,
};

export function usePostsQuery(params: PostListParams) {
  return useQuery({
    queryKey: postsQueryKeys.list(params),
    queryFn: () => postsApi.getAll(params),
  });
}

export function usePostQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: postsQueryKeys.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled,
  });
}

export function useCreatePostMutation() {
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
}

export function useUpdatePostMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof postsApi.update>[1] }) =>
      postsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
}

export function useDeletePostMutation() {
  return useMutation({
    mutationFn: postsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
}
