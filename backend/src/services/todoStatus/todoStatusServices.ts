import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/utils/prisma";

type TodoStatusRecord = {
  id: number;
  displayName: string;
  priority: number;
};

function createTodoStatusRecord(
  todoStatus: Prisma.TodoStatusGetPayload<object>,
): TodoStatusRecord {
  return {
    id: todoStatus.id,
    displayName: todoStatus.displayName,
    priority: todoStatus.priority,
  };
}

export class TodoStatusListService {
  constructor() {}
  async getData(): Promise<TodoStatusRecord[]> {
    const rows = await prisma.todoStatus.findMany({
      orderBy: {
        priority: "asc",
      },
    });
    return rows.map(createTodoStatusRecord);
  }
}

interface ITodoStatusUpdateService {
  displayName?: string;
  priority?: number;
}
export class TodoStatusUpdateService {
  private todoStatusId: number;
  private displayName?: string;
  private priority?: number;
  constructor(
    todoStatusId: number,
    { displayName, priority }: ITodoStatusUpdateService,
  ) {
    this.todoStatusId = todoStatusId;
    this.displayName = displayName;
    this.priority = priority;
  }
  async update(): Promise<TodoStatusRecord> {
    const todoStatus = await prisma.todoStatus.update({
      where: { id: this.todoStatusId },
      data: { displayName: this.displayName, priority: this.priority },
    });
    return todoStatus;
  }
  async getData(): Promise<TodoStatusRecord> {
    const todoStatus = await this.update();
    return createTodoStatusRecord(todoStatus);
  }
}

export class TodoStatusDeleteService {
  private todoStatusId: number;
  constructor(todoStatusId: number) {
    this.todoStatusId = todoStatusId;
  }
  async delete(): Promise<void> {
    await prisma.todoStatus.delete({
      where: { id: this.todoStatusId },
    });
  }
}

interface ITodoStatusCreateService {
  displayName: string;
  priority: number;
}

export class TodoStatusCreateService {
  private displayName: string;
  private priority: number;
  constructor({ displayName, priority }: ITodoStatusCreateService) {
    this.displayName = displayName;
    this.priority = priority;
  }
  async getData(): Promise<TodoStatusRecord> {
    const todoStatus = await prisma.todoStatus.create({
      data: { displayName: this.displayName, priority: this.priority },
    });
    return createTodoStatusRecord(todoStatus);
  }
}
