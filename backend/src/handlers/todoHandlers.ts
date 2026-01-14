import { prisma } from "@/utils/prisma";
import { Request, Response } from "express";
import { z } from "zod";

export const listTodoHandler = async (req: Request, res: Response) => {
  const rows = await prisma.todo.findMany();
  res.json(rows);
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

  try {
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
