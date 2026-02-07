// 앱 첫 화면에서 핵심 동선을 제공
import { Link } from "react-router-dom";
import { BaseLayout } from "@/components/templates/BaseLayout";
import { Button } from "@/components/ui/button";
import { routes } from "@/shared/constants/routes";

export function HomePage() {
  return (
    <BaseLayout>
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Pick-e-Eat MVP</h1>
        <p className="text-sm text-slate-600">
          Atomic Design + Feature 모듈 패턴으로 확장 가능한 CRUD 예시입니다.
        </p>
        <Button asChild>
          <Link to={routes.posts.list}>게시글 보러가기</Link>
        </Button>
      </section>
    </BaseLayout>
  );
}
