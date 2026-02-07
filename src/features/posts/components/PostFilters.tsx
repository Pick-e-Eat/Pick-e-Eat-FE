// 목록 필터 UI를 도메인 전용으로 구성
import { SearchInput } from "@/components/molecules/SearchInput";
import { usePostFilters } from "../hooks/usePostFilters";

export function PostFilters() {
  const { filters, setFilters } = usePostFilters();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <SearchInput
        value={filters.search}
        onChange={(value) => setFilters({ search: value })}
        onSearch={() => setFilters({ search: filters.search })}
      />
      <select
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
        value={filters.isPublished === undefined ? "all" : filters.isPublished ? "published" : "draft"}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "all") {
            setFilters({ isPublished: undefined });
          } else {
            setFilters({ isPublished: value === "published" });
          }
        }}
      >
        <option value="all">전체</option>
        <option value="published">공개</option>
        <option value="draft">비공개</option>
      </select>
    </div>
  );
}
