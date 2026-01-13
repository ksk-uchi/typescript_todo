import { prisma } from "@/utils/prisma";
import { TypedRequestBody } from "@/utils/request";
import { Request, Response } from "express";

export const listTodoHandler = async (req: Request, res: Response) => {
  const rows = await prisma.todo.findMany();
  res.json(rows);
};

export const createTodoHandler = async (
  req: TypedRequestBody<{
    title: string;
    description?: string;
    statusId: number;
  }>,
  res: Response
) => {
  const statuses = await prisma.todoStatus.findMany({
    where: {
      id: req.body.statusId,
    },
  });
  if (statuses.length === 0) {
    res.status(400).json({
      errorMsg: `invalid statudId(${req.body.statusId})`,
    });
    return;
  }
  const status = statuses[0];
  await prisma.todo.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      status: {
        connect: {
          id: status.id,
        },
      },
    },
  });
  res.status(201).send();
};
