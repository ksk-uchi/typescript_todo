import { app } from "@/app";
import { prisma } from "@/utils/prisma";
import request from "supertest";
import {
  rollbackTransaction,
  startTransaction,
} from "tests/helpers/prismaTransaction";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// CSRF token helper
const getCsrfToken = async () => {
  const getResponse = await request(app).get("/todo");
  const cookies = getResponse.headers["set-cookie"] as unknown as string[];
  const csrfCookie = cookies.find((c: string) => c.startsWith("_csrf="));
  const token = csrfCookie?.split(";")[0].split("=")[1];
  return { token, cookies };
};

describe("todoHandlers Integration", () => {
  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  it("[GET /todo] todo を一覧取得できること", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "test title",
          description: "test description",
        },
        {
          title: "test title",
          description: "test description",
        },
      ],
    });
    const todos = await prisma.todo.findMany();

    const response = await request(app).get("/todo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("todo");
    expect(response.body.todo).toHaveLength(2);
    expect(response.body.meta).toEqual({
      totalCount: 2,
      totalPage: 1,
      currentPage: 1,
      itemsPerPage: 20,
      hasNext: false,
      hasPrevious: false,
    });
    // Soritng check: updated_at desc, id asc
    // The created todos have same updated_at/created_at (transactional or fast enough)
    // Order might rely on ID if updated_at is same.
    expect(response.body.todo[0].id).toBeLessThan(response.body.todo[1].id);
    expect(response.body.todo).toEqual(
      todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        createdAt: todo.createdAt.toISOString(),
        updated_at: todo.updated_at.toISOString(),
        done_at: null,
      })),
    );
  });

  it("[GET /todo] 完了済みの todo はデフォルトで取得されないこと", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "active todo",
          done_at: null,
        },
        {
          title: "done todo",
          done_at: new Date(),
        },
      ],
    });

    const response = await request(app).get("/todo");

    expect(response.status).toBe(200);
    expect(response.body.todo).toHaveLength(1);
    expect(response.body.todo[0].title).toBe("active todo");
  });

  it("[GET /todo] include_done=true で完了済みの todo も取得できること", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "active todo",
          done_at: null,
        },
        {
          title: "done todo",
          done_at: new Date(),
        },
      ],
    });

    const response = await request(app).get("/todo?include_done=true");

    expect(response.status).toBe(200);
    expect(response.body.todo).toHaveLength(2);
  });

  it("[GET /todo] ページネーションが動作すること", async () => {
    // Create 30 todos
    const data = Array.from({ length: 30 }).map((_, i) => ({
      title: `todo ${i + 1}`,
    }));
    await prisma.todo.createMany({ data });

    // Page 1, Default 20 items
    const res1 = await request(app).get("/todo");
    expect(res1.body.todo).toHaveLength(20);
    expect(res1.body.meta).toEqual({
      totalCount: 30,
      totalPage: 2,
      currentPage: 1,
      itemsPerPage: 20,
      hasNext: true,
      hasPrevious: false,
    });

    // Page 2, Default 20 items (should have 10 remaining)
    const res2 = await request(app).get("/todo?page=2");
    expect(res2.body.todo).toHaveLength(10);
    expect(res2.body.meta).toEqual({
      totalCount: 30,
      totalPage: 2,
      currentPage: 2,
      itemsPerPage: 20,
      hasNext: false,
      hasPrevious: true,
    });
  });

  it("[GET /todo] items_per_page が動作すること", async () => {
    const data = Array.from({ length: 5 }).map((_, i) => ({
      title: `todo ${i + 1}`,
    }));
    await prisma.todo.createMany({ data });

    const res = await request(app).get("/todo?items_per_page=3");
    expect(res.body.todo).toHaveLength(3);
    expect(res.body.meta).toEqual({
      totalCount: 5,
      totalPage: 2,
      currentPage: 1,
      itemsPerPage: 3,
      hasNext: true,
      hasPrevious: false,
    });
  });

  it("[GET /todo] 存在しないページは 404 を返すこと", async () => {
    await prisma.todo.create({ data: { title: "test" } });
    const res = await request(app).get("/todo?page=100");
    expect(res.status).toBe(404);
  });

  it("[GET /todo] items_per_page の最大値(100)を超えると 422 エラー", async () => {
    const res = await request(app).get("/todo?items_per_page=101");
    expect(res.status).toBe(422);
  });

  it("[GET /todo/:id] todo を1件取得できること", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        description: "test description",
      },
    });

    const response = await request(app).get(`/todo/${todo.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      createdAt: todo.createdAt.toISOString(),
      updated_at: todo.updated_at.toISOString(),
      done_at: null,
    });
  });

  it("[GET /todo/:id] todo が存在しない場合は 404 を返すこと", async () => {
    const response = await request(app).get("/todo/999999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Todo(999999999) not found",
    });
  });

  it("[GET /todo/:id] todo の id が数値でない場合は 400 を返すこと", async () => {
    const response = await request(app).get("/todo/abc");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        todoId: "invalid_type",
      },
    });
  });

  it("[POST /todo] todo を作成できること", async () => {
    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .post("/todo")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ title: "test title" });

    expect(response.status).toBe(201);
    const createdTodo = await prisma.todo.findUnique({
      where: { id: response.body.id },
    });
    expect(createdTodo).not.toBeNull();
    expect(createdTodo).toEqual({
      id: response.body.id,
      title: "test title",
      description: null,
      createdAt: expect.any(Date),
      updated_at: expect.any(Date),
      done_at: null,
    });
  });

  it("[PATCH /todo/:id] todo を更新できること", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        description: "test description",
      },
    });

    const requestBody = {
      title: "new title",
      description: "new description",
    };

    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .patch(`/todo/${todo.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send(requestBody);

    expect(response.status).toBe(200);

    const expectedTodo = {
      id: todo.id,
      title: requestBody.title,
      description: requestBody.description,
    };
    expect(response.body).toEqual({
      ...expectedTodo,
      createdAt: todo.createdAt.toISOString(),
      updated_at: expect.any(String),
      done_at: null,
    });

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
    });
    expect(updatedTodo).toEqual({
      ...expectedTodo,
      createdAt: todo.createdAt,
      updated_at: expect.any(Date),
      done_at: null,
    });
  });

  it("[PATCH /todo/:id] todo が存在しない場合は 404 を返すこと", async () => {
    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .patch("/todo/999999999")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ title: "updated" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Todo(999999999) not found",
    });
  });

  it("[PATCH /todo/:id] todo の id が数値でない場合は 422 を返すこと", async () => {
    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .patch("/todo/abc")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ title: "updated" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        todoId: "invalid_type",
      },
    });
  });

  it("[DELETE /todo/:id] todo が削除できること", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        description: "test description",
      },
    });

    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .delete(`/todo/${todo.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string);

    expect(response.status).toBe(200);

    expect(
      await prisma.todo.count({
        where: { id: todo.id },
      }),
    ).equal(0);
  });

  it("[DELETE /todo/:id] todo が存在しない場合は 404 を返すこと", async () => {
    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .delete("/todo/999999999")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Todo(999999999) not found",
    });
  });

  it("[DELETE /todo/:id] todo の id が数値でない場合は 422 を返すこと", async () => {
    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .delete("/todo/abc")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "",
      targets: {
        todoId: "invalid_type",
      },
    });
  });

  it("[PUT /todo/done/:id] todo を完了状態にできること", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "test title",
      },
    });

    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .put(`/todo/done/${todo.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ is_done: true });

    expect(response.status).toBe(200);
    expect(response.body.done_at).not.toBeNull();

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
    });
    expect(updatedTodo?.done_at).not.toBeNull();
  });

  it("[PUT /todo/done/:id] todo を未完了状態に戻せること", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "test title",
        done_at: new Date(),
      },
    });

    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .put(`/todo/done/${todo.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ is_done: false });

    expect(response.status).toBe(200);
    expect(response.body.done_at).toBeNull();

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
    });
    expect(updatedTodo?.done_at).toBeNull();
  });

  it("[PUT /todo/done/:id] バリデーションエラーが返ること", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "test title",
      },
    });

    const { token, cookies } = await getCsrfToken();
    const response = await request(app)
      .put(`/todo/done/${todo.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ is_done: "invalid" });

    expect(response.status).toBe(422);
  });
});
