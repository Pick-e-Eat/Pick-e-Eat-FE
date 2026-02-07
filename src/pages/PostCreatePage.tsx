// 새 게시글 생성 플로우를 담당하는 페이지
import { useNavigate } from "react-router-dom";
import { BaseLayout } from "@/components/templates/BaseLayout";
import { PostForm } from "@/features/posts/components/PostForm";
import { useCreatePostMutation } from "@/features/posts/api/posts.queries";
import { routes } from "@/shared/constants/routes";

export function PostCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreatePostMutation();

  return (
    <BaseLayout>
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">새 게시글</h1>
        <PostForm
          onSubmit={(values) =>
            createMutation.mutate(values, {
              onSuccess: () => navigate(routes.posts.list),
            })
          }
        />
      </section>
    </BaseLayout>
  );
}
