export interface Todo {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  done_at: string | null;
}

export type CreateTodoDto = Pick<Todo, "title" | "description">;
export type UpdateTodoDto = Partial<Pick<Todo, "title" | "description">>;
