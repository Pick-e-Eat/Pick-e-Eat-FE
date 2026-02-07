// UI 상태를 클라이언트 상태로 분리해 관리
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PostFilters } from "../types/post.types";

interface PostsUIState {
  filters: PostFilters;
  selectedPostIds: Set<number>;
  isCreateModalOpen: boolean;
  setFilters: (filters: Partial<PostFilters>) => void;
  togglePostSelection: (id: number) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

export const usePostsStore = create<PostsUIState>()(
  devtools(
    (set) => ({
      filters: { search: "", isPublished: undefined },
      selectedPostIds: new Set(),
      isCreateModalOpen: false,
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      togglePostSelection: (id) =>
        set((state) => {
          const next = new Set(state.selectedPostIds);
          next.has(id) ? next.delete(id) : next.add(id);
          return { selectedPostIds: next };
        }),
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),
    }),
    { name: "posts-ui" },
  ),
);
