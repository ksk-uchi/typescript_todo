import { NotFoundError, ValidationError } from "@/errors/clientSideError";
import {
  TodoStatusCreateService,
  TodoStatusDeleteService,
  TodoStatusListService,
  TodoStatusUpdateService,
} from "@/services/todoStatus/todoStatusServices";
import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";
import { z } from "zod";

export const listTodoStatusHandler = async (req: Request, res: Response) => {
  const todoStatusListService = new TodoStatusListService();
  const rows = await todoStatusListService.getData();
  res.json({
    todoStatus: rows,
  });
};

export const updateTodoStatusHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoStatusId: z.coerce.number().int(),
  });
  const paramParseResult = paramSchema.safeParse(req.params);
  if (!paramParseResult.success) {
    throw new ValidationError("", paramParseResult.error);
  }
  const { todoStatusId } = paramParseResult.data;
  const todoStatusCount = await prisma.todoStatus.count({
    where: { id: todoStatusId },
  });
  if (todoStatusCount === 0) {
    throw new NotFoundError(`TodoStatus(${todoStatusId}) not found`);
  }

  const bodySchema = z.object({
    displayName: z.string().optional(),
    priority: z.number().int().optional(),
  });
  const bodyParseResult = bodySchema.safeParse(req.body);
  if (!bodyParseResult.success) {
    throw new ValidationError("", bodyParseResult.error);
  }
  const { displayName, priority } = bodyParseResult.data;
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
      throw new ValidationError("", {
        priority: `Same priority(${priority}) already exists`,
      });
    }
  }

  const todoStatusUpdateService = new TodoStatusUpdateService(todoStatusId, {
    displayName,
    priority,
  });
  const todoStatus = await todoStatusUpdateService.getData();
  res.json(todoStatus);
};

export const deleteTodoStatusHandler = async (req: Request, res: Response) => {
  const paramSchema = z
    .object({
      todoStatusId: z.coerce.number().int(),
    })
    .superRefine(async (data, ctx) => {
      // todoStatusId を参照するデータが todo に存在するかチェック
      if (data.todoStatusId) {
        const count = await prisma.todo.count({
          where: { todoStatusId: data.todoStatusId },
        });

        if (count > 0) {
          ctx.addIssue({
            code: "invalid_value",
            path: ["todoStatusId"],
            values: [],
            message: `TodoStatusId(${data.todoStatusId}) is used by todo`,
          });
        }
      }
    });
  const result = await paramSchema.safeParseAsync(req.params);
  if (!result.success) {
    throw new ValidationError("", result.error);
  }

  const todoStatusDeleteService = new TodoStatusDeleteService(
    result.data.todoStatusId,
  );
  await todoStatusDeleteService.delete();
  res.status(204).send();
};

export const createTodoStatusHandler = async (req: Request, res: Response) => {
  const bodySchema = z
    .object({
      displayName: z.string(),
      priority: z.number().int(),
    })
    .superRefine(async (data, ctx) => {
      // priority が重複していないかチェック
      const count = await prisma.todoStatus.count({
        where: { priority: data.priority },
      });
      if (count > 0) {
        ctx.addIssue({
          code: "invalid_value",
          path: ["priority"],
          values: [],
          message: `Priority(${data.priority}) already exists`,
        });
      }
    });
  const result = await bodySchema.safeParseAsync(req.body);
  if (!result.success) {
    throw new ValidationError("", result.error);
  }

  const todoStatusCreateService = new TodoStatusCreateService(result.data);
  const todoStatus = await todoStatusCreateService.getData();
  res.json(todoStatus);
};
