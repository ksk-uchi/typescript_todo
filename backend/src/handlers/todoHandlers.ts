import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";
import { z } from "zod";

export const listTodoHandler = async (req: Request, res: Response) => {
  const rows = await prisma.todo.findMany();
  res.json(rows);
};

export const createTodoHandler = async (req: Request, res: Response) => {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    statusId: z.number().int().positive(),
  });

  try {
    const { title, description, statusId } = schema.parse(req.body);

    const statuses = await prisma.todoStatus.findMany({
      where: {
        id: statusId,
      },
    });

    if (statuses.length === 0) {
      res.status(400).json({
        errorMsg: `invalid statudId(${statusId})`,
      });
      return;
    }

    const status = statuses[0];

    await prisma.todo.create({
      data: {
        title: title,
        description: description,
        status: {
          connect: {
            id: status.id,
          },
        },
      },
    });

    res.status(201).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        errorMsg: z.flattenError(error),
      });
    } else {
      res.status(500).json({
        errorMsg: "Internal server error",
      });
    }
  }
};
