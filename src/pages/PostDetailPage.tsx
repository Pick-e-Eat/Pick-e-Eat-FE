// 상세 페이지에서 게시글 단건 데이터를 보여줌
import { useNavigate, useParams } from "react-router-dom";
import { BaseLayout } from "@/components/templates/BaseLayout";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Button } from "@/components/ui/button";
import { useDeletePostMutation, usePostQuery } from "@/features/posts/api/posts.queries";
import { routes } from "@/shared/constants/routes";

export function PostDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const postId = Number(params.id);
  const isValidId = Number.isFinite(postId) && postId > 0;

  const { data, isPending, isError } = usePostQuery(postId, isValidId);
  const deleteMutation = useDeletePostMutation();

  if (!isValidId) {
    return (
      <BaseLayout>
        <EmptyState message="유효하지 않은 게시글입니다." />
      </BaseLayout>
    );
  }

  if (isPending) {
    return (
      <BaseLayout>
        <LoadingSpinner />
      </BaseLayout>
    );
  }

  if (isError || !data) {
    return (
      <BaseLayout>
        <EmptyState message="게시글을 불러오지 못했습니다." />
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <p className="text-slate-600">{data.content}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(routes.posts.list)}>
            목록으로
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deleteMutation.mutate(data.id, {
                onSuccess: () => navigate(routes.posts.list),
              })
            }
          >
            삭제
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
}
