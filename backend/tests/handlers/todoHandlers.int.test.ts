import { app } from "@/app";
import { prisma } from "@/utils/prisma";
import request from "supertest";
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

  it("[GET /todo] todo を一覧取得できること", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "Done", priority: 0 },
        { displayName: "InProgress", priority: 1 },
      ],
    });
    const statuses = await prisma.todoStatus.findMany();

    await prisma.todo.createMany({
      data: [
        {
          title: "test title",
          description: "test description",
          todoStatusId: statuses[0].id,
        },
        {
          title: "test title",
          description: "test description",
          todoStatusId: statuses[1].id,
        },
      ],
    });
    const todos = await prisma.todo.findMany();

    const response = await request(app).get("/todo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("todo");
    expect(response.body.todo).toHaveLength(2);
    expect(response.body).toEqual({
      todo: todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        statusId: todo.todoStatusId,
        createdAt: todo.createdAt.toISOString(),
      })),
    });
  });

  it("[GET /todo/:id] todo を1件取得できること", async () => {
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

    const response = await request(app).get(`/todo/${todo.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      statusId: todo.todoStatusId,
      createdAt: todo.createdAt.toISOString(),
    });
  });

  it("[GET /todo/:id] todo が存在しない場合は 404 を返すこと", async () => {
    const response = await request(app).get("/todo/999999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Todo(999999999) not found",
    });
  });

  it("[GET /todo/:id] todo の id が数値でない場合は 400 を返すこと", async () => {
    const response = await request(app).get("/todo/abc");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        todoId: "invalid_type",
      },
    });
  });

  it("[POST /todo] todo を作成できること", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Done", priority: 0 },
    });

    const response = await request(app)
      .post("/todo")
      .send({ title: "test title", statusId: status.id });

    expect(response.status).toBe(201);
    const createdTodo = await prisma.todo.findUnique({
      where: { id: response.body.id },
    });
    expect(createdTodo).not.toBeNull();
    expect(createdTodo).toEqual({
      id: response.body.id,
      title: "test title",
      description: null,
      todoStatusId: status.id,
      createdAt: expect.any(Date),
    });
  });

  it("[POST /todo] 存在しないステータスで todo が作成できないこと", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Done", priority: 0 },
    });

    const response = await request(app)
      .post("/todo")
      .send({ title: "test title", statusId: status.id + 1 });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        statusId: "invalid_value",
      },
    });
  });

  it("[PATCH /todo/:id] todo を更新できること", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "Done", priority: 0 },
        { displayName: "InProgress", priority: 1 },
      ],
    });
    const statuses = await prisma.todoStatus.findMany();

    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        description: "test description",
        todoStatusId: statuses[0].id,
      },
    });

    const requestBody = {
      title: "new title",
      description: "new description",
      statusId: statuses[1].id,
    };

    const response = await request(app)
      .patch(`/todo/${todo.id}`)
      .send(requestBody);

    expect(response.status).toBe(200);

    const expectedTodo = {
      id: todo.id,
      title: requestBody.title,
      description: requestBody.description,
    };
    expect(response.body).toEqual({
      ...expectedTodo,
      statusId: requestBody.statusId,
      createdAt: todo.createdAt.toISOString(),
    });

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
    });
    expect(updatedTodo).toEqual({
      ...expectedTodo,
      todoStatusId: requestBody.statusId,
      createdAt: todo.createdAt,
    });
  });

  it("[PATCH /todo/:id] todo が存在しない場合は 404 を返すこと", async () => {
    const response = await request(app).patch("/todo/999999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Todo(999999999) not found",
    });
  });

  it("[PATCH /todo/:id] todo の id が数値でない場合は 422 を返すこと", async () => {
    const response = await request(app).patch("/todo/abc");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        todoId: "invalid_type",
      },
    });
  });

  it("[PATCH /todo/:id] 存在しないステータスで todo が更新できないこと", async () => {
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

    const requestBody = {
      title: "new title",
      description: "new description",
      statusId: status.id + 1,
    };

    const response = await request(app)
      .patch(`/todo/${todo.id}`)
      .send(requestBody);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        statusId: "invalid_value",
      },
    });
  });

  it("[DELETE /todo/:id] todo が削除できること", async () => {
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

    const response = await request(app).delete(`/todo/${todo.id}`);

    expect(response.status).toBe(200);

    expect(
      await prisma.todo.count({
        where: { id: todo.id },
      }),
    ).equal(0);
  });

  it("[DELETE /todo/:id] todo が存在しない場合は 404 を返すこと", async () => {
    const response = await request(app).delete("/todo/999999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Todo(999999999) not found",
    });
  });

  it("[DELETE /todo/:id] todo の id が数値でない場合は 422 を返すこと", async () => {
    const response = await request(app).delete("/todo/abc");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        todoId: "invalid_type",
      },
    });
  });
});
