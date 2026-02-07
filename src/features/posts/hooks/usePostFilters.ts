// 도메인 전용 필터 로직을 훅으로 분리
import { useShallow } from "zustand/react/shallow";
import { usePostsStore } from "../stores/posts.store";

export function usePostFilters() {
  const { filters, setFilters } = usePostsStore(
    useShallow((state) => ({ filters: state.filters, setFilters: state.setFilters })),
  );

  return {
    filters,
    setFilters,
  };
}
