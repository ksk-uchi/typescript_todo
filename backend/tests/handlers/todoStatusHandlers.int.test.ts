import {
  createTodoStatusHandler,
  deleteTodoStatusHandler,
  listTodoStatusHandler,
  updateTodoStatusHandler,
} from "@/handlers/todoStatusHandlers";
import { prisma } from "@/utils/prisma";
import { createRequest, createResponse } from "node-mocks-http";
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

  it("ステータス一覧が priority 順に取得できること", async () => {
    // 既存データをクリアしてテスト環境を整える
    await prisma.todoStatus.deleteMany();

    // テストデータの作成（順不同で挿入）
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "Low", priority: 2 },
        { displayName: "High", priority: 1 },
        { displayName: "Middle", priority: 3 },
      ],
    });

    const req = createRequest();
    const res = createResponse();

    await listTodoStatusHandler(req, res);

    expect(res.statusCode).toBe(200);
    const responseData = res._getJSONData();

    expect(responseData.todoStatus).toHaveLength(3);
    // priority の昇順になっているか確認
    expect(responseData.todoStatus[0]).toMatchObject({
      displayName: "High",
      priority: 1,
    });
    expect(responseData.todoStatus[1]).toMatchObject({
      displayName: "Low",
      priority: 2,
    });
    expect(responseData.todoStatus[2]).toMatchObject({
      displayName: "Middle",
      priority: 3,
    });
  });

  it("priority が重複する場合はエラーを返すこと", async () => {
    await prisma.todoStatus.createMany({
      data: [
        { displayName: "TODO", priority: 1 },
        { displayName: "DOING", priority: 2 },
      ],
    });
    const targetTodoStatus = await prisma.todoStatus.findFirst({
      where: { displayName: "TODO" },
    });

    const req = createRequest({
      params: { todoStatusId: targetTodoStatus?.id },
      body: { displayName: "Pending", priority: 2 },
    });
    const res = createResponse();

    await updateTodoStatusHandler(req, res);

    expect(res.statusCode).toBe(400);
    const responseData = res._getData();

    expect(responseData).toBe("Priority(2) already exists");
  });

  it("削除しようとした todo ステータスが使用されている場合は 400 を返すこと", async () => {
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

    const req = createRequest({
      params: { todoStatusId: statuses[0].id },
    });
    const res = createResponse();

    await deleteTodoStatusHandler(req, res);

    expect(res.statusCode).toBe(400);
    const responseData = res._getData();

    expect(responseData).toEqual({
      fieldErrors: {
        todoStatusId: [`TodoStatusId(${statuses[0].id}) is used by todo`],
      },
      formErrors: [],
    });
  });

  it("todo ステータス作成で priority が重複する場合は 400 を返すこと", async () => {
    await prisma.todoStatus.create({
      data: { displayName: "TODO", priority: 1 },
    });

    const req = createRequest({
      body: { displayName: "Pending", priority: 1 },
    });
    const res = createResponse();

    await createTodoStatusHandler(req, res);

    expect(res.statusCode).toBe(400);
    const responseData = res._getData();

    expect(responseData).toEqual({
      fieldErrors: {
        priority: ["Priority(1) already exists"],
      },
      formErrors: [],
    });
  });
});
