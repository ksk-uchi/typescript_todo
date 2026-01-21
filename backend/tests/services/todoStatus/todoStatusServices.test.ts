import { prismaMock } from "tests/helpers/prismaMock";
import { describe, expect, it } from "vitest";

import {
  TodoStatusCreateService,
  TodoStatusDeleteService,
  TodoStatusListService,
  TodoStatusUpdateService,
} from "@/services/todoStatus/todoStatusServices";

describe("todoStatusServices", () => {
  describe("TodoStatusListService", () => {
    it("todoStatus を全件取得できる", async () => {
      const mockStatuses = [
        { id: 1, displayName: "TODO", priority: 1 },
        { id: 2, displayName: "DOING", priority: 2 },
        { id: 3, displayName: "DONE", priority: 3 },
      ];
      prismaMock.todoStatus.findMany.mockResolvedValue(mockStatuses);

      const service = new TodoStatusListService();
      const statuses = await service.getData();

      expect(statuses).toEqual(mockStatuses);
      expect(prismaMock.todoStatus.findMany).toHaveBeenCalledTimes(1);
      // priority の昇順で取得していることを確認
      expect(prismaMock.todoStatus.findMany).toHaveBeenCalledWith({
        orderBy: {
          priority: "asc",
        },
      });
    });
  });

  describe("TodoStatusUpdateService", () => {
    it("todoStatus を更新できる", async () => {
      const mockStatus = { id: 1, displayName: "TODO", priority: 1 };
      prismaMock.todoStatus.update.mockResolvedValue(mockStatus);

      const service = new TodoStatusUpdateService(1, {
        displayName: "TODO",
        priority: 1,
      });

      const status = await service.getData();

      expect(status).toEqual(mockStatus);
      expect(prismaMock.todoStatus.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { displayName: "TODO", priority: 1 },
      });
    });
  });

  describe("TodoStatusDeleteService", () => {
    it("todo ステータスを削除できる", async () => {
      prismaMock.todo.count.mockResolvedValue(0);

      const service = new TodoStatusDeleteService(1);

      await service.delete();

      expect(prismaMock.todoStatus.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("TodoStatusCreateService", () => {
    it("todoStatus を作成できる", async () => {
      const mockStatus = { id: 1, displayName: "TODO", priority: 1 };
      prismaMock.todoStatus.count.mockResolvedValue(0);
      prismaMock.todoStatus.create.mockResolvedValue(mockStatus);

      const service = new TodoStatusCreateService({
        displayName: "TODO",
        priority: 1,
      });

      const status = await service.getData();

      expect(status).toEqual(mockStatus);
      expect(prismaMock.todoStatus.create).toHaveBeenCalledWith({
        data: { displayName: "TODO", priority: 1 },
      });
    });
  });
});
