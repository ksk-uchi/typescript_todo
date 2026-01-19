import { createRequest, createResponse } from "node-mocks-http";
import { describe, expect, it } from "vitest";
import { prismaMock } from "../helpers/prismaMock";

import {
  createTodoHandler,
  deleteTodoHandler,
  detailTodoHandler,
  listTodoHandler,
  updateTodoHandler,
} from "@/handlers/todoHandlers";

describe("todoHandlers", () => {
  describe("listTodoHandler", () => {
    it("全件取得して JSON で返すこと", async () => {
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

      const req = createRequest();
      const res = createResponse();

      await listTodoHandler(req, res);

      expect(res.statusCode).toBe(200);
      const expectTodos = {
        todo: mockTodos.map((todo) => {
          return {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            statusId: todo.todoStatusId,
            createdAt: todo.createdAt.toISOString(),
          };
        }),
      };
      expect(res._getJSONData()).toEqual(expectTodos);
      expect(prismaMock.todo.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("detailTodoHandler", () => {
    it("一件取得して JSON で返すこと", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        todoStatusId: 1,
        createdAt: new Date(),
      };
      prismaMock.todo.findUnique.mockResolvedValue(mockTodo);

      const req = createRequest();
      req.params.todoId = "1";
      const res = createResponse();

      await detailTodoHandler(req, res);

      expect(res.statusCode).toBe(200);
      const expectTodo = {
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        statusId: mockTodo.todoStatusId,
        createdAt: mockTodo.createdAt.toISOString(),
      };
      expect(res._getJSONData()).toEqual(expectTodo);
      expect(prismaMock.todo.findUnique).toHaveBeenCalledTimes(1);
    });

    it("todoId が数値化できる文字列ではないときエラー", async () => {
      const mockTodo = {
        id: 1,
        title: "Task 1",
        description: null,
        todoStatusId: 1,
        createdAt: new Date(),
      };
      prismaMock.todo.findUnique.mockResolvedValue(mockTodo);

      const req = createRequest();
      req.params.todoId = "test";
      const res = createResponse();

      await detailTodoHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        errorMsg: {
          fieldErrors: {
            todoId: ["Invalid input: expected number, received NaN"],
          },
          formErrors: [],
        },
      });
    });
  });

  describe("createTodoHandler", () => {
    it("リクエストに statusId がないとエラー", async () => {
      // 該当する status が見つからない状態をシミュレート
      prismaMock.todoStatus.count.mockResolvedValue(0);

      const req = createRequest({
        body: { title: "New Task", status: 999 },
      });
      const res = createResponse();

      await createTodoHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        errorMsg: {
          formErrors: [],
          fieldErrors: {
            statusId: ["Invalid input: expected number, received undefined"],
          },
        },
      });
      // todo.create が呼ばれていないことを確認
      expect(prismaMock.todo.create).not.toHaveBeenCalled();
    });

    it("無効な statusId の場合に 400 エラーを返すこと", async () => {
      // 該当する status が見つからない状態をシミュレート
      prismaMock.todoStatus.count.mockResolvedValue(0);

      const req = createRequest({
        body: { title: "New Task", statusId: 999 },
      });
      const res = createResponse();

      await createTodoHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        errorMsg: {
          formErrors: [],
          fieldErrors: {
            statusId: ["Invalid statusId(999)"],
          },
        },
      });
      // todo.create が呼ばれていないことを確認
      expect(prismaMock.todo.create).not.toHaveBeenCalled();
    });

    it("有効なデータの場合に 201 を返し Todo を作成すること", async () => {
      const mockTodoStatus = {
        id: 1,
        displayName: "Done",
        priority: 0,
      };
      prismaMock.todoStatus.findMany.mockResolvedValue([mockTodoStatus]);
      const mockTodo = {
        id: 1,
        title: "test title",
        description: "test description",
        todoStatusId: 1,
        createdAt: new Date(),
      };
      prismaMock.todo.create.mockResolvedValue(mockTodo);

      const req = createRequest({
        body: { title: "New Task", description: "Desc", statusId: 1 },
      });
      const res = createResponse();

      await createTodoHandler(req, res);

      expect(res.statusCode).toBe(201);
      const expectTodo = {
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        statusId: mockTodo.todoStatusId,
        createdAt: mockTodo.createdAt.toISOString(),
      };
      expect(res._getJSONData()).toEqual(expectTodo);
      expect(prismaMock.todo.create).toHaveBeenCalledWith({
        data: {
          title: "New Task",
          description: "Desc",
          status: { connect: { id: 1 } },
        },
      });
    });
  });

  describe("updateTodoHandler", () => {
    it("todoId が数値化できる文字列ではないときエラー", async () => {
      const req = createRequest();
      req.params.todoId = "test";
      const res = createResponse();

      await updateTodoHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        errorMsg: {
          fieldErrors: {
            todoId: ["Invalid input: expected number, received NaN"],
          },
          formErrors: [],
        },
      });
    });
  });

  describe("deleteTodoHandler", () => {
    it("todoId が数値化できる文字列ではないときエラー", async () => {
      const req = createRequest();
      req.params.todoId = "test";
      const res = createResponse();

      await deleteTodoHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        errorMsg: {
          fieldErrors: {
            todoId: ["Invalid input: expected number, received NaN"],
          },
          formErrors: [],
        },
      });
    });
    it("削除ができる", async () => {
      const req = createRequest();
      req.params.todoId = "1";
      const res = createResponse();

      await deleteTodoHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prismaMock.todo.delete).toHaveBeenCalledOnce();
    });
  });
});
