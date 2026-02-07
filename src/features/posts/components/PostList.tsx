// 게시글 카드 목록과 페이지네이션을 함께 제공
import { Button } from "@/components/ui/button";
import { usePagination } from "@/shared/hooks/usePagination";
import type { Post } from "../types/post.types";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: Post[];
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PostList({ posts, total, pageSize, currentPage, onPageChange }: PostListProps) {
  const { pages, hasNext, hasPrev } = usePagination({ total, pageSize, currentPage });

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => onPageChange(currentPage - 1)}>
          이전
        </Button>
        <div className="flex gap-2">
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(currentPage + 1)}>
          다음
        </Button>
      </div>
    </div>
  );
}
