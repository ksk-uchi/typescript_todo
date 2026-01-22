export interface Todo {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export type CreateTodoDto = Pick<Todo, "title" | "description">;
export type UpdateTodoDto = Partial<Pick<Todo, "title" | "description">>;
