import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/utils/prisma";

type TodoRecord = {
  id: number;
  title: string;
  description: string | null;
  statusId: number;
  createdAt: Date;
};
function createTodoRecord(todo: Prisma.TodoGetPayload<object>): TodoRecord {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    statusId: todo.todoStatusId,
    createdAt: todo.createdAt,
  };
}

export class TodoListService {
  constructor() {}
  async getData(): Promise<TodoRecord[]> {
    const todoList = await prisma.todo.findMany();
    return todoList.map(createTodoRecord);
  }
}

export class TodoDetailService {
  private todoId: number;
  constructor(todoId: number) {
    this.todoId = todoId;
  }
  async getData(): Promise<TodoRecord | null> {
    const todo = await prisma.todo.findUnique({
      where: {
        id: this.todoId,
      },
    });
    return todo ? createTodoRecord(todo) : null;
  }
}

interface ITodoCreateService {
  title: string;
  description?: string;
  statusId: number;
}
export class TodoCreateService {
  private title: string;
  private description?: string;
  private statusId: number;

  constructor({ title, description, statusId }: ITodoCreateService) {
    this.title = title;
    this.description = description;
    this.statusId = statusId;
  }

  async create(): Promise<Prisma.TodoGetPayload<object>> {
    const todo = await prisma.todo.create({
      data: {
        title: this.title,
        description: this.description,
        todoStatusId: this.statusId,
      },
    });
    return todo;
  }

  async getData(): Promise<TodoRecord> {
    const todo = await this.create();
    return createTodoRecord(todo);
  }
}

interface ITodoUpdateService {
  title?: string;
  description?: string;
  statusId?: number;
}
export class TodoUpdateService {
  private todoId: number;
  private title?: string;
  private description?: string;
  private statusId?: number;

  constructor(
    todoId: number,
    { title, description, statusId }: ITodoUpdateService,
  ) {
    this.todoId = todoId;
    this.title = title;
    this.description = description;
    this.statusId = statusId;
  }

  async update(): Promise<Prisma.TodoGetPayload<object>> {
    const todo = await prisma.todo.update({
      where: {
        id: this.todoId,
      },
      data: {
        title: this.title,
        description: this.description,
        todoStatusId: this.statusId,
      },
    });
    return todo;
  }

  async getData(): Promise<TodoRecord> {
    const todo = await this.update();
    return createTodoRecord(todo);
  }
}

export class TodoDeleteService {
  private todoId: number;
  constructor(todoId: number) {
    this.todoId = todoId;
  }
  async delete(): Promise<void> {
    await prisma.todo.delete({
      where: {
        id: this.todoId,
      },
    });
  }
}
