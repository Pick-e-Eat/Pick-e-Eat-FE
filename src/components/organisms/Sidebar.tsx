// 대시보드형 레이아웃을 위한 사이드바 구성 요소
import { Link } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <nav className="flex flex-col gap-2 text-sm">
        <Link to={routes.posts.list} className="rounded-md px-3 py-2 hover:bg-slate-100">
          게시글 목록
        </Link>
        <Link to={routes.posts.create} className="rounded-md px-3 py-2 hover:bg-slate-100">
          새 게시글
        </Link>
      </nav>
    </aside>
  );
}
