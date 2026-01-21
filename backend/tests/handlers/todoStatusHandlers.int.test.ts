import { app } from "@/app";
import { prisma } from "@/utils/prisma";
import request from "supertest";
import {
  rollbackTransaction,
  startTransaction,
} from "tests/helpers/prismaTransaction";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("todoStatusHandlers Integration", () => {
  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  it("[GET /todo_status] todo ステータスを一覧取得できること", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "Low", priority: 2 },
        { displayName: "High", priority: 1 },
        { displayName: "Middle", priority: 3 },
      ],
    });

    const res = await request(app).get("/todo_status");

    expect(res.statusCode).toBe(200);
    expect(res.body.todoStatus).toHaveLength(3);
    expect(res.body.todoStatus[0]).toMatchObject({
      displayName: "High",
      priority: 1,
    });
    expect(res.body.todoStatus[1]).toMatchObject({
      displayName: "Low",
      priority: 2,
    });
    expect(res.body.todoStatus[2]).toMatchObject({
      displayName: "Middle",
      priority: 3,
    });
  });

  it("[PATCH /todo_status/:id] todo ステータスを更新できること", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Low", priority: 2 },
    });

    const res = await request(app)
      .patch(`/todo_status/${status.id}`)
      .send({ displayName: "High", priority: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      displayName: "High",
      priority: 1,
    });
  });

  it("[PATCH /todo_status/:id] priority が重複する場合は 422 を返すこと", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "TODO", priority: 1 },
        { displayName: "DOING", priority: 2 },
      ],
    });
    const targetTodoStatus = await prisma.todoStatus.findFirst({
      where: { displayName: "TODO" },
    });

    const res = await request(app)
      .patch(`/todo_status/${targetTodoStatus?.id}`)
      .send({ displayName: "Pending", priority: 2 });

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      message: "",
      targets: {
        priority: "Same priority(2) already exists",
      },
    });
  });

  it("[PATCH /todo_status/:id] id が存在しない場合は 404 を返すこと", async () => {
    const res = await request(app).patch(`/todo_status/9999`).send({
      displayName: "High",
      priority: 1,
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "TodoStatus(9999) not found",
    });
  });

  it("[PATCH /todo_status/:id] id が数値でない場合は 422 を返すこと", async () => {
    const res = await request(app).patch(`/todo_status/abc`).send({
      displayName: "High",
      priority: 1,
    });

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      message: "",
      targets: {
        todoStatusId: "invalid_type",
      },
    });
  });

  it("[DELETE /todo_status/:id] todo ステータスを削除できること", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Low", priority: 2 },
    });

    const res = await request(app).delete(`/todo_status/${status.id}`);

    expect(res.statusCode).toBe(204);
    const deletedStatus = await prisma.todoStatus.findUnique({
      where: { id: status.id },
    });
    expect(deletedStatus).toBeNull();
  });

  it("[DELETE /todo_status/:id] 削除しようとした todo ステータスが使用されている場合は 422 を返すこと", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "TODO", priority: 1 },
        { displayName: "DOING", priority: 2 },
      ],
    });
    const statuses = await prisma.todoStatus.findMany();
    await prisma.todo.create({
      data: {
        title: "test",
        description: "test",
        todoStatusId: statuses[0].id,
      },
    });

    const res = await request(app).delete(`/todo_status/${statuses[0].id}`);

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      message: "",
      targets: {
        todoStatusId: "invalid_value",
      },
    });
  });

  it("[POST /todo_status] todo ステータス作成できること", async () => {
    const res = await request(app).post(`/todo_status`).send({
      displayName: "Pending",
      priority: 1,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      displayName: "Pending",
      priority: 1,
    });
  });

  it("[POST /todo_status] todo ステータス作成で priority が重複する場合は 422 を返すこと", async () => {
    await prisma.todoStatus.create({
      data: { displayName: "TODO", priority: 1 },
    });

    const res = await request(app).post(`/todo_status`).send({
      displayName: "Pending",
      priority: 1,
    });

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      message: "",
      targets: {
        priority: "invalid_value",
      },
    });
  });
});
