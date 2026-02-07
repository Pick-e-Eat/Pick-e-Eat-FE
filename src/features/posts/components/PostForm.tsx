// 게시글 생성/수정 폼을 공통 컴포넌트로 분리
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postCreateSchema, type PostCreate } from "../types/post.types";

interface PostFormProps {
  defaultValues?: Partial<PostCreate>;
  onSubmit: (values: PostCreate) => void;
  submitLabel?: string;
}

export function PostForm({ defaultValues, onSubmit, submitLabel = "저장" }: PostFormProps) {
  const form = useForm<PostCreate>({
    resolver: zodResolver(postCreateSchema),
    defaultValues: {
      title: "",
      content: "",
      isPublished: false,
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div className="space-y-1">
        <label htmlFor="content" className="text-sm font-medium">
          내용
        </label>
        <textarea
          id="content"
          className="min-h-[120px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          {...register("content")}
        />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isPublished")} />
        공개 여부
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
