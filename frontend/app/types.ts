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

export interface TodoStatus {
  id: number;
  displayName: string;
  priority: number;
}

export type UpdateTodoStatusDto = Partial<
  Pick<TodoStatus, "displayName" | "priority">
>;

export type CreateTodoStatusDto = Pick<TodoStatus, "displayName" | "priority">;
