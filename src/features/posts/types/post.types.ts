// posts 도메인 타입과 스키마를 한 파일에서 관리
import { z } from "zod";

export interface Post {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostListParams {
  skip?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
}

export interface PostFilters {
  search: string;
  isPublished?: boolean;
}

export const postCreateSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200, "200자 이내로 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  isPublished: z.boolean().default(false),
});

export const postUpdateSchema = postCreateSchema.partial();

export type PostCreate = z.infer<typeof postCreateSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
