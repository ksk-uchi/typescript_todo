import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";
import { z } from "zod";

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

export const updateTodoStatusHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoStatusId: z.coerce.number().int(),
  });
  const { todoStatusId } = paramSchema.parse(req.params);
  const bodySchema = z.object({
    displayName: z.string().optional(),
    priority: z.number().int().optional(),
  });

  const { displayName, priority } = bodySchema.parse(req.body);
  if (priority !== undefined) {
    const samePriorityTodoStatusCount = await prisma.todoStatus.count({
      where: {
        priority: priority,
        id: {
          not: todoStatusId,
        },
      },
    });
    if (samePriorityTodoStatusCount > 0) {
      return res.status(400).send(`Priority(${priority}) already exists`);
    }
  }

  const todoStatus = await prisma.todoStatus.update({
    where: { id: todoStatusId },
    data: { displayName, priority },
  });
  const response = {
    todoStatus: createTodoStatusResponse(todoStatus),
  };
  res.json(response);
};
