import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";

type TodoStatusResponse = {
  id: number;
  displayName: string;
  priority: number;
};

function createTodoStatusResponse(
  todoStatus: Prisma.TodoStatusGetPayload<object>,
): TodoStatusResponse {
  return {
    id: todoStatus.id,
    displayName: todoStatus.displayName,
    priority: todoStatus.priority,
  };
}

export const listTodoStatusHandler = async (req: Request, res: Response) => {
  const rows = await prisma.todoStatus.findMany({
    orderBy: {
      priority: "asc",
    },
  });
  const response = {
    todoStatus: rows.map(createTodoStatusResponse),
  };
  res.json(response);
};
