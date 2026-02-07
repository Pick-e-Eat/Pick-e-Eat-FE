// 공통 API 응답 형태를 재사용하기 위한 타입 정의
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
