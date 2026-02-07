// 게시글 요약 정보를 카드 형태로 표시
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/shared/utils/format";
import type { Post } from "../types/post.types";

interface PostCardProps {
  post: Post;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{post.title}</CardTitle>
        <StatusBadge
          label={post.isPublished ? "공개" : "비공개"}
          tone={post.isPublished ? "success" : "warning"}
        />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{post.content}</p>
        <p className="mt-2 text-xs text-slate-400">{formatDate(post.createdAt)}</p>
      </CardContent>
      {(onEdit || onDelete) && (
        <CardFooter className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(post.id)}>
              수정
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(post.id)}>
              삭제
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
