import { listTodoStatusHandler } from "@/handlers/todoStatusHandlers";
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
});
