// 라우트 미매칭 시 보여줄 기본 페이지
import { Link } from "react-router-dom";
import { BaseLayout } from "@/components/templates/BaseLayout";
import { Button } from "@/components/ui/button";
import { routes } from "@/shared/constants/routes";

export function NotFoundPage() {
  return (
    <BaseLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다.</h1>
        <Button asChild>
          <Link to={routes.home}>홈으로 이동</Link>
        </Button>
      </div>
    </BaseLayout>
  );
}
