export interface Todo {
  id: number;
  title: string;
  description: string;
  statusId: number;
  createdAt: string;
}

export type CreateTodoDto = Pick<Todo, "title" | "description" | "statusId">;
export type UpdateTodoDto = Partial<
  Pick<Todo, "title" | "description" | "statusId">
>;
