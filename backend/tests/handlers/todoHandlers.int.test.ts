import {
  createTodoHandler,
  deleteTodoHandler,
  updateTodoHandler,
} from "@/handlers/todoHandlers";
import { prisma } from "@/utils/prisma";
import { createRequest, createResponse } from "node-mocks-http";
import {
  rollbackTransaction,
  startTransaction,
} from "tests/helpers/prismaTransaction";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("todoHandlers Integration", () => {
  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  it("存在しないステータスで todo が作成できないこと", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Done", priority: 0 },
    });

    const req = createRequest({
      body: { title: "test title", statusId: status.id + 1 },
    });
    const res = createResponse();

    await createTodoHandler(req, res);

    const count = await prisma.todo.count();
    expect(res.statusCode).toBe(400);
    expect(count).toBe(0);
    expect(res._getJSONData()).toEqual({
      errorMsg: {
        formErrors: [],
        fieldErrors: {
          statusId: [`Invalid statusId(${status.id + 1})`],
        },
      },
    });
  });

  it("todo が正常に更新できること", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "Done", priority: 0 },
        { displayName: "InProgress", priority: 1 },
      ],
    });
    const statuses = await prisma.todoStatus.findMany();
    expect(statuses.length).toBe(2);

    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        description: "test description",
        todoStatusId: statuses[0].id,
      },
    });

    const requestBody = {
      title: "new title",
      statusId: statuses[1].id,
    };
    const req = createRequest({
      body: requestBody,
    });
    req.params.todoId = `${todo.id}`;
    const res = createResponse();

    await updateTodoHandler(req, res);

    expect(res.statusCode).toBe(200);

    expect(res._getJSONData()).toEqual({
      id: todo.id,
      title: requestBody.title,
      description: todo.description,
      statusId: requestBody.statusId,
      createdAt: todo.createdAt.toISOString(),
    });

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
    });
    expect(updatedTodo).toEqual({
      ...todo,
      title: requestBody.title,
      todoStatusId: requestBody.statusId,
    });
  });

  it("todo が削除できること", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Done", priority: 0 },
    });

    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        description: "test description",
        todoStatusId: status.id,
      },
    });

    const req = createRequest();
    req.params.todoId = `${todo.id}`;
    const res = createResponse();

    await deleteTodoHandler(req, res);

    expect(res.statusCode).toBe(200);

    expect(
      await prisma.todo.count({
        where: { id: todo.id },
      }),
    ).equal(0);
  });
});
