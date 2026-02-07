// 전역 헤더를 레이아웃 섹션 단위로 구성
import { Link } from "react-router-dom";
import { Logo } from "@/components/atoms/Logo";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to={routes.home}>
          <Logo />
        </Link>
        <nav className="flex items-center gap-3">
          <Link to={routes.posts.list} className="text-sm text-slate-600 hover:text-slate-900">
            게시글
          </Link>
          <Button asChild variant="outline">
            <Link to={routes.posts.create}>새 글</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
