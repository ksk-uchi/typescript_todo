import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";
import { z } from "zod";

export const listTodoHandler = async (req: Request, res: Response) => {
  const rows = await prisma.todo.findMany();
  const response = {
    todo: rows,
  };
  res.json(response);
};

export const detailTodoHandler = async (req: Request, res: Response) => {
  const schema = z.object({
    todoId: z.coerce.number<string>(),
  });

  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      errorMsg: z.flattenError(result.error),
    });
  }

  const { todoId } = result.data;
  const todo = await prisma.todo.findUnique({
    where: {
      id: todoId,
    },
  });
  if (!todo) {
    return res.status(404);
  }

  res.json(todo);
};

export const createTodoHandler = async (req: Request, res: Response) => {
  const schema = z
    .object({
      title: z.string().min(1),
      description: z.string().optional(),
      statusId: z.number().int().positive(),
    })
    .superRefine(async (data, ctx) => {
      // statusId が存在する場合のみチェックを実行
      if (data.statusId) {
        const count = await prisma.todoStatus.count({
          where: { id: data.statusId },
        });

        if (count === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["statusId"], // エラーを出すフィールドを指定
            message: `Invalid statusId(${data.statusId})`,
          });
        }
      }
    });

  const result = await schema.safeParseAsync(req.body);
  if (!result.success) {
    return res.status(400).json({
      errorMsg: z.flattenError(result.error),
    });
  }
  const { title, description, statusId } = await schema.parseAsync(req.body);

  await prisma.todo.create({
    data: {
      title: title,
      description: description,
      status: {
        connect: {
          id: statusId,
        },
      },
    },
  });

  res.status(201).send();
};

export const updateTodoHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoId: z.coerce.number<string>(),
  });

  const paramResult = paramSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errorMsg: z.flattenError(paramResult.error),
    });
  }

  const { todoId } = paramResult.data;
  const todo = await prisma.todo.findUnique({
    where: {
      id: todoId,
    },
  });
  if (!todo) {
    return res.status(404);
  }

  const reqSchema = z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      statusId: z.number().int().positive().optional(),
    })
    .superRefine(async (data, ctx) => {
      if (data.statusId) {
        const count = await prisma.todoStatus.count({
          where: { id: data.statusId },
        });

        if (count === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["statusId"],
            message: `Invalid statusId(${data.statusId})`,
          });
        }
      }
    });

  const reqResult = await reqSchema.safeParseAsync(req.body);
  if (!reqResult.success) {
    return res.status(400).json({
      errorMsg: z.flattenError(reqResult.error),
    });
  }
  const { title, description, statusId } = reqResult.data;

  try {
    const updatedTodo = await prisma.todo.update({
      where: { id: todo.id },
      data: {
        title: title,
        description: description,
        todoStatusId: statusId,
      },
    });
    res.json(updatedTodo);
  } catch {
    return res.status(500).send("Update failed.");
  }
};

export const deleteTodoHandler = async (req: Request, res: Response) => {
  const paramSchema = z.object({
    todoId: z.coerce.number<string>(),
  });

  const paramResult = paramSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({
      errorMsg: z.flattenError(paramResult.error),
    });
  }

  const { todoId } = paramResult.data;
  try {
    await prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(404).send();
      }
    }
    return res.status(500).send("Delete failed.");
  }
  res.status(200).send();
};
