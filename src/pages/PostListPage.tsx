// 목록 페이지에서 필터 + 리스트 조합을 구성
import { useMemo, useState } from "react";
import { BaseLayout } from "@/components/templates/BaseLayout";
import { EmptyState } from "@/components/molecules/EmptyState";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { PostFilters } from "@/features/posts/components/PostFilters";
import { PostList } from "@/features/posts/components/PostList";
import { usePostsQuery } from "@/features/posts/api/posts.queries";
import { usePostsStore } from "@/features/posts/stores/posts.store";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 10;

export function PostListPage() {
  const filters = usePostsStore((state) => state.filters);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 300);

  const queryParams = useMemo(
    () => ({
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      isPublished: filters.isPublished,
    }),
    [page, debouncedSearch, filters.isPublished],
  );

  const { data, isPending, isError } = usePostsQuery(queryParams);

  if (isPending) {
    return (
      <BaseLayout>
        <LoadingSpinner />
      </BaseLayout>
    );
  }

  if (isError) {
    return (
      <BaseLayout>
        <EmptyState message="게시글을 불러오지 못했습니다." />
      </BaseLayout>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <BaseLayout>
        <PostFilters />
        <div className="mt-6">
          <EmptyState message="게시글이 없습니다." />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <PostFilters />
      <div className="mt-6">
        <PostList
          posts={data.items}
          total={data.total}
          pageSize={data.limit}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </BaseLayout>
  );
}
