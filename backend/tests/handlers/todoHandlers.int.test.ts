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
});
