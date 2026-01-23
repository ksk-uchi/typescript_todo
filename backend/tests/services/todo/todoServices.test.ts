import { prismaMock } from "tests/helpers/prismaMock";
import { describe, expect, it } from "vitest";

import {
  TodoCreateService,
  TodoDeleteService,
  TodoDetailService,
  TodoDoneService,
  TodoListService,
  TodoUpdateService,
} from "@/services/todo/todoServices";

// Helper function for creating mock todo objects
type MockTodo = {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updated_at: Date;
  done_at: Date | null;
};

const createMockTodo = (overrides?: Partial<MockTodo>): MockTodo => ({
  id: 1,
  title: "Test Todo",
  description: null,
  createdAt: new Date(),
  updated_at: new Date(),
  done_at: null,
  ...overrides,
});

describe("todoServices", () => {
  describe("TodoListService", () => {
    it("todo を全件取得できる", async () => {
      const mockTodos = [
        createMockTodo({
          id: 2,
          title: "Todo 2",
          updated_at: new Date("2023-01-02"),
        }),
        createMockTodo({
          id: 1,
          title: "Todo 1",
          updated_at: new Date("2023-01-01"),
        }),
      ];

      prismaMock.todo.findMany.mockResolvedValue(mockTodos);

      const service = new TodoListService();
      const result = await service.getData();

      expect(prismaMock.todo.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.todo.findMany).toHaveBeenCalledWith({
        where: { done_at: null },
        orderBy: [{ updated_at: "desc" }, { id: "asc" }],
      });
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Todo 2");
      expect(result[1].title).toBe("Todo 1");
    });

    it("includeDone=true の場合、全件取得するクエリが発行される", async () => {
      const mockTodos = [
        {
          id: 1,
          title: "Task 1",
          description: null,
          createdAt: new Date(),
          updated_at: new Date(),
          done_at: null,
        },
      ];
      prismaMock.todo.findMany.mockResolvedValue(mockTodos);
      prismaMock.todo.count.mockResolvedValue(1);

      const service = new TodoListService({ includeDone: true });
      await service.getData();

      expect(prismaMock.todo.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.todo.findMany).toHaveBeenCalledWith({
        where: {},
        skip: undefined,
        take: undefined,
        orderBy: [{ updated_at: "desc" }, { id: "asc" }],
      });
      expect(prismaMock.todo.count).toHaveBeenCalledTimes(1);
    });
  });
  describe("TodoDetailService", () => {
    it("todo を1件取得できる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        createdAt: new Date(),
        updated_at: new Date(),
        done_at: null,
      };
      prismaMock.todo.findUnique.mockResolvedValue(mockTodo);

      const service = new TodoDetailService(1);
      const todo = await service.getData();

      expect(prismaMock.todo.findUnique).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        createdAt: mockTodo.createdAt,
        updated_at: mockTodo.updated_at,
        done_at: mockTodo.done_at,
      });
    });
  });
  describe("TodoCreateService", () => {
    it("todo を作成できる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        createdAt: new Date(),
        updated_at: new Date(),
        done_at: null,
      };
      prismaMock.todo.create.mockResolvedValue(mockTodo);

      const service = new TodoCreateService({
        title: "Task 1",
      });
      const todo = await service.getData();

      expect(prismaMock.todo.create).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        createdAt: mockTodo.createdAt,
        updated_at: mockTodo.updated_at,
        done_at: mockTodo.done_at,
      });
    });
  });
  describe("TodoUpdateService", () => {
    it("todo を更新できる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        createdAt: new Date(),
        updated_at: new Date(),
        done_at: null,
      };
      prismaMock.todo.update.mockResolvedValue(mockTodo);

      const service = new TodoUpdateService(1, {
        title: "Task 1",
      });
      const todo = await service.getData();

      expect(prismaMock.todo.update).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        createdAt: mockTodo.createdAt,
        updated_at: mockTodo.updated_at,
        done_at: mockTodo.done_at,
      });
    });
  });
  describe("TodoDeleteService", () => {
    it("todo を削除できる", async () => {
      const service = new TodoDeleteService(1);
      await service.delete();

      expect(prismaMock.todo.delete).toHaveBeenCalledTimes(1);
    });
  });
  describe("TodoDoneService", () => {
    it("todo を完了状態にできる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        createdAt: new Date(),
        updated_at: new Date(),
        done_at: new Date(),
      };
      prismaMock.todo.update.mockResolvedValue(mockTodo);

      const service = new TodoDoneService(1, true);
      const todo = await service.getData();

      expect(prismaMock.todo.update).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        createdAt: mockTodo.createdAt,
        updated_at: mockTodo.updated_at,
        done_at: mockTodo.done_at,
      });
    });

    it("todo を未完了状態にできる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        createdAt: new Date(),
        updated_at: new Date(),
        done_at: null,
      };
      prismaMock.todo.update.mockResolvedValue(mockTodo);

      const service = new TodoDoneService(1, false);
      const todo = await service.getData();

      expect(prismaMock.todo.update).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        createdAt: mockTodo.createdAt,
        updated_at: mockTodo.updated_at,
        done_at: mockTodo.done_at,
      });
    });
  });
});
