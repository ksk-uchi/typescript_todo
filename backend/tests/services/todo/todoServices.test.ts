import { prismaMock } from "tests/helpers/prismaMock";
import { describe, expect, it } from "vitest";

import {
  TodoCreateService,
  TodoDeleteService,
  TodoDetailService,
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
          todoStatusId: 1,
          createdAt: new Date(),
        },
      ];
      prismaMock.todo.findMany.mockResolvedValue(mockTodos);

      const service = new TodoListService();
      const todos = await service.getData();

      expect(prismaMock.todo.findMany).toHaveBeenCalledTimes(1);
      expect(todos).toEqual(
        mockTodos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          statusId: todo.todoStatusId,
          createdAt: todo.createdAt,
        })),
      );
    });
  });
  describe("TodoDetailService", () => {
    it("todo を1件取得できる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        todoStatusId: 1,
        createdAt: new Date(),
      };
      prismaMock.todo.findUnique.mockResolvedValue(mockTodo);

      const service = new TodoDetailService(1);
      const todo = await service.getData();

      expect(prismaMock.todo.findUnique).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        statusId: mockTodo.todoStatusId,
        createdAt: mockTodo.createdAt,
      });
    });
  });
  describe("TodoCreateService", () => {
    it("todo を作成できる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        todoStatusId: 1,
        createdAt: new Date(),
      };
      prismaMock.todo.create.mockResolvedValue(mockTodo);

      const service = new TodoCreateService({
        title: "Task 1",
        statusId: 1,
      });
      const todo = await service.getData();

      expect(prismaMock.todo.create).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        statusId: mockTodo.todoStatusId,
        createdAt: mockTodo.createdAt,
      });
    });
  });
  describe("TodoUpdateService", () => {
    it("todo を更新できる", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        todoStatusId: 1,
        createdAt: new Date(),
      };
      prismaMock.todo.update.mockResolvedValue(mockTodo);

      const service = new TodoUpdateService(1, {
        title: "Task 1",
        statusId: 1,
      });
      const todo = await service.getData();

      expect(prismaMock.todo.update).toHaveBeenCalledTimes(1);
      expect(todo).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        statusId: mockTodo.todoStatusId,
        createdAt: mockTodo.createdAt,
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
});
