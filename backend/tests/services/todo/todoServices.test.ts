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

describe("todoServices", () => {
  describe("TodoListService", () => {
    it("todo を全件取得できる", async () => {
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

      const service = new TodoListService();
      const { todos, totalCount } = await service.getData();

      expect(prismaMock.todo.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.todo.findMany).toHaveBeenCalledWith({
        where: { done_at: null },
        skip: undefined,
        take: undefined,
        orderBy: [{ updated_at: "desc" }, { id: "asc" }],
      });
      expect(prismaMock.todo.count).toHaveBeenCalledTimes(1);
      expect(prismaMock.todo.count).toHaveBeenCalledWith({
        where: { done_at: null },
      });
      expect(todos).toEqual(
        mockTodos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          createdAt: todo.createdAt,
          updated_at: todo.updated_at,
          done_at: todo.done_at,
        })),
      );
      expect(totalCount).toBe(1);
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
