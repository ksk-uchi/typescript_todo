import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/utils/prisma";

type TodoRecord = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  done_at: Date | null;
};
function createTodoRecord(todo: Prisma.TodoGetPayload<object>): TodoRecord {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    createdAt: todo.createdAt,
    done_at: todo.done_at,
  };
}

export class TodoListService {
  private includeDone: boolean;

  constructor(options?: { includeDone?: boolean }) {
    this.includeDone = options?.includeDone ?? false;
  }

  async getData(): Promise<TodoRecord[]> {
    const doneCondition: Prisma.TodoWhereInput = this.includeDone
      ? {}
      : { done_at: null };
    const todoList = await prisma.todo.findMany({
      where: {
        ...doneCondition,
      },
    });
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
}
export class TodoCreateService {
  private title: string;
  private description?: string;

  constructor({ title, description }: ITodoCreateService) {
    this.title = title;
    this.description = description;
  }

  async create(): Promise<Prisma.TodoGetPayload<object>> {
    const todo = await prisma.todo.create({
      data: {
        title: this.title,
        description: this.description,
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
}
export class TodoUpdateService {
  private todoId: number;
  private title?: string;
  private description?: string;

  constructor(todoId: number, { title, description }: ITodoUpdateService) {
    this.todoId = todoId;
    this.title = title;
    this.description = description;
  }

  async update(): Promise<Prisma.TodoGetPayload<object>> {
    const todo = await prisma.todo.update({
      where: {
        id: this.todoId,
      },
      data: {
        title: this.title,
        description: this.description,
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

export class TodoDoneService {
  private todoId: number;
  private isDone: boolean;

  constructor(todoId: number, isDone: boolean) {
    this.todoId = todoId;
    this.isDone = isDone;
  }

  async update(): Promise<Prisma.TodoGetPayload<object>> {
    const data: Prisma.TodoUpdateInput = {
      done_at: this.isDone ? new Date() : null,
    };
    const todo = await prisma.todo.update({
      where: {
        id: this.todoId,
      },
      data,
    });
    return todo;
  }

  async getData(): Promise<TodoRecord> {
    const todo = await this.update();
    return createTodoRecord(todo);
  }
}
