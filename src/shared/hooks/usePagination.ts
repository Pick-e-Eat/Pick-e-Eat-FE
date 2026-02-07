// 페이지네이션 계산을 표준화해 페이지 컴포넌트를 단순화
import { useMemo } from "react";

interface PaginationOptions {
  total: number;
  pageSize: number;
  currentPage: number;
}

export function usePagination({ total, pageSize, currentPage }: PaginationOptions) {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);
    return {
      totalPages,
      pages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }, [total, pageSize, currentPage]);
}
