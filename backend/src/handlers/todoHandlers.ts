import { NotFoundError, ValidationError } from "@/errors/clientSideError";
import { Prisma } from "@/generated/prisma/client";
import {
  TodoCreateService,
  TodoDeleteService,
  TodoDetailService,
  TodoDoneService,
  TodoListService,
  TodoUpdateService,
} from "@/services/todo/todoServices";
import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";
import { z } from "zod";

export const listTodoHandler = async (req: Request, res: Response) => {
  const schema = z.object({
    include_done: z
      .string()
      .optional()
      .default("false")
      .transform((v) => v === "true"),
    page: z.coerce.number().min(1).default(1),
    items_per_page: z.coerce.number().min(1).max(100).default(20),
  });
  const result = schema.safeParse(req.query);
  if (!result.success) {
    throw new ValidationError("", result.error);
  }
  const { include_done, page, items_per_page } = result.data;

  const skip = (page - 1) * items_per_page;
  const take = items_per_page;

  const service = new TodoListService({
    includeDone: include_done,
    skip,
    take,
  });
  const { todos, totalCount } = await service.getData();

  const totalPage = Math.ceil(totalCount / items_per_page);
  // page > totalPage の場合、404エラー (ただし0件の場合は1ページ目を許容するか、あるいは0件でも問答無用で404か。要件は "Xページ目が存在しない場合は404"。0件のときは1ページ目も存在しない？
  // 通常 0件のときは totalPage=0. page=1 > 0 となる.
  // しかし空配列を返すのが一般的か。
  // background: "Xページ目が存在しない場合は404エラー"
  // 実装としては、totalCount > 0 かつ page > totalPage なら 404 とする。
  // totalCount === 0 の場合、page=1 は許容、page > 1 は 404。
  if (totalCount > 0 && page > totalPage) {
    throw new NotFoundError(`Page ${page} not found`);
  }
  if (totalCount === 0 && page > 1) {
    throw new NotFoundError(`Page ${page} not found`);
  }

  res.json({
    todo: todos,
    meta: {
      totalCount,
      totalPage,
      currentPage: page,
      itemsPerPage: items_per_page,
      hasNext: page < totalPage,
      hasPrevious: page > 1,
    },
  });
};

export const detailTodoHandler = async (req: Request, res: Response) => {
  const schema = z.object({
    todoId: z.coerce.number<string>(),
  });
  const result = schema.safeParse(req.params);
  if (!result.success) {
    throw new ValidationError("", result.error);
  }
  const { todoId } = result.data;

  const service = new TodoDetailService(todoId);
  const todo = await service.getData();
  if (!todo) {
    throw new NotFoundError(`Todo(${todoId}) not found`);
  }

  res.json(todo);
};

export const createTodoHandler = async (req: Request, res: Response) => {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  });
  const result = await schema.safeParseAsync(req.body);
  if (!result.success) {
    throw new ValidationError("", result.error);
  }

  const service = new TodoCreateService(result.data);
  const todo = await service.getData();

  res.status(201).json(todo);
};

export const updateTodoHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoId: z.coerce.number<string>(),
  });
  const paramResult = paramSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new ValidationError("", paramResult.error);
  }
  const { todoId } = paramResult.data;
  const todo = await prisma.todo.findUnique({
    where: {
      id: todoId,
    },
  });
  if (!todo) {
    throw new NotFoundError(`Todo(${todoId}) not found`);
  }

  const reqSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  });
  const reqResult = await reqSchema.safeParseAsync(req.body);
  if (!reqResult.success) {
    throw new ValidationError("", reqResult.error);
  }

  try {
    const service = new TodoUpdateService(todoId, reqResult.data);
    const updatedTodo = await service.getData();
    res.json(updatedTodo);
  } catch {
    throw new Error("Update failed.");
  }
};

export const deleteTodoHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoId: z.coerce.number<string>(),
  });
  const paramResult = paramSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new ValidationError("", paramResult.error);
  }
  const { todoId } = paramResult.data;

  try {
    const service = new TodoDeleteService(todoId);
    await service.delete();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // 削除対象が存在しない
      if (err.code === "P2025") {
        throw new NotFoundError(`Todo(${todoId}) not found`);
      }
    }
    throw new Error("Delete failed.");
  }
  res.status(200).send();
};

export const updateTodoStatusHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoId: z.coerce.number<string>(),
  });
  const paramResult = paramSchema.safeParse(req.params);
  if (!paramResult.success) {
    throw new ValidationError("", paramResult.error);
  }
  const { todoId } = paramResult.data;

  const todo = await prisma.todo.findUnique({
    where: {
      id: todoId,
    },
  });
  if (!todo) {
    throw new NotFoundError(`Todo(${todoId}) not found`);
  }

  const reqSchema = z.object({
    is_done: z.boolean(),
  });
  const reqResult = await reqSchema.safeParseAsync(req.body);
  if (!reqResult.success) {
    throw new ValidationError("", reqResult.error);
  }
  const { is_done } = reqResult.data;

  try {
    const service = new TodoDoneService(todoId, is_done);
    const updatedTodo = await service.getData();
    res.json(updatedTodo);
  } catch {
    throw new Error("Update status failed.");
  }
};
