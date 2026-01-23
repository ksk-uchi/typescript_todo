import { app } from "@/app";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("CSRF Middleware", () => {
  it("should set _csrf cookie on GET request", async () => {
    const response = await request(app).get("/todo");
    expect(response.status).toBe(200);

    const cookies = response.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();

    const csrfCookie = cookies.find((c: string) => c.startsWith("_csrf="));
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie).toContain("Path=/");
    expect(csrfCookie).toContain("SameSite=Lax");
  });

  it("should accept POST request with valid CSRF token in header", async () => {
    // 1. Get Token
    const getResponse = await request(app).get("/todo");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];
    const csrfCookie = cookies.find((c: string) => c.startsWith("_csrf="));
    const token = csrfCookie?.split(";")[0].split("=")[1];

    expect(token).toBeDefined();

    // 2. Post with Token
    const postResponse = await request(app)
      .post("/todo")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ title: "Test Todo" });

    expect(postResponse.status).not.toBe(403);
  });

  it("should reject POST request without CSRF token in header", async () => {
    // 1. Get Token
    const getResponse = await request(app).get("/todo");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];

    // 2. Post without Header
    const postResponse = await request(app)
      .post("/todo")
      .set("Cookie", cookies)
      .send({ title: "Test Todo" });

    expect(postResponse.status).toBe(403);
  });

  it("should reject POST request with mismatched CSRF token", async () => {
    const getResponse = await request(app).get("/todo");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];

    const postResponse = await request(app)
      .post("/todo")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", "invalid-token")
      .send({ title: "Test Todo" });

    expect(postResponse.status).toBe(403);
  });
});
