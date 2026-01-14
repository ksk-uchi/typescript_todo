import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createResponse, createRequest } from "node-mocks-http";
import { createTodoHandler } from "@/handlers/todoHandlers";
import { prisma } from "@/utils/prisma";
import {
  startTransaction,
  rollbackTransaction,
} from "tests/helpers/prismaTransaction";

describe("todoHandlers Integration", () => {
  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  it("Todoを作成してもテスト終了後にロールバックされること", async () => {
    const status = await prisma.todoStatus.create({
      data: { displayName: "Done", priority: 0 },
    });

    const req = createRequest({
      body: { title: "vprisma test", statusId: status.id },
    });
    const res = createResponse();

    await createTodoHandler(req, res);

    const count = await prisma.todo.count();
    expect(res.statusCode).toBe(201);
    expect(count).toBe(1);
  });
});
