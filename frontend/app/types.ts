export interface Todo {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updated_at: string;
  done_at: string | null;
}

export type CreateTodoDto = Pick<Todo, "title" | "description">;
export type UpdateTodoDto = Partial<Pick<Todo, "title" | "description">>;

export interface PaginationMeta {
  totalCount: number;
  totalPage: number;
  currentPage: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GetTodoListResponse {
  todo: Todo[];
  meta: PaginationMeta;
}
