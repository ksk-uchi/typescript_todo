import { createRequest, createResponse } from "node-mocks-http";
import { describe, expect, it } from "vitest";
import { prismaMock } from "../helpers/prismaMock";

import {
  listTodoStatusHandler,
  updateTodoStatusHandler,
} from "@/handlers/todoStatusHandlers";

describe("todoStatusHandlers", () => {
  describe("listTodoStatusHandler", () => {
    it("全件取得して JSON で返すこと", async () => {
      const mockStatuses = [
        { id: 1, displayName: "TODO", priority: 1 },
        { id: 2, displayName: "DOING", priority: 2 },
        { id: 3, displayName: "DONE", priority: 3 },
      ];
      prismaMock.todoStatus.findMany.mockResolvedValue(mockStatuses);

      const req = createRequest();
      const res = createResponse();

      await listTodoStatusHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        todoStatus: mockStatuses,
      });
      // priority の昇順で取得していることを確認
      expect(prismaMock.todoStatus.findMany).toHaveBeenCalledWith({
        orderBy: {
          priority: "asc",
        },
      });
    });
  });

  describe("updateTodoStatusHandler", () => {
    it("更新して JSON で返すこと", async () => {
      const mockStatus = { id: 1, displayName: "TODO", priority: 1 };
      prismaMock.todoStatus.count.mockResolvedValue(0);
      prismaMock.todoStatus.update.mockResolvedValue(mockStatus);

      const req = createRequest({
        params: { todoStatusId: 1 },
        body: { displayName: "TODO", priority: 1 },
      });
      const res = createResponse();

      await updateTodoStatusHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        todoStatus: mockStatus,
      });
      expect(prismaMock.todoStatus.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { displayName: "TODO", priority: 1 },
      });
    });
  });
});
