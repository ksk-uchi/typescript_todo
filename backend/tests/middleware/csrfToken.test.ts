import { app } from "@/app";
import request from "supertest";
import { describe, expect, it } from "vitest";

// Add dummy endpoints for testing CSRF middleware
app.get("/test-csrf-middleware", (_, res) => {
  res.status(200).send("OK");
});

app.post("/test-csrf-middleware", (_, res) => {
  res.status(200).send("OK");
});

describe("CSRF Middleware", () => {
  it("should set _csrf cookie on GET request", async () => {
    const response = await request(app).get("/test-csrf-middleware");
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
    const getResponse = await request(app).get("/test-csrf-middleware");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];
    const csrfCookie = cookies.find((c: string) => c.startsWith("_csrf="));
    const token = csrfCookie?.split(";")[0].split("=")[1];

    expect(token).toBeDefined();

    // 2. Post with Token
    const postResponse = await request(app)
      .post("/test-csrf-middleware")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ data: "test" });

    expect(postResponse.status).toBe(200);
  });

  it("should reject POST request without CSRF token in header", async () => {
    // 1. Get Token
    const getResponse = await request(app).get("/test-csrf-middleware");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];

    // 2. Post without Header
    const postResponse = await request(app)
      .post("/test-csrf-middleware")
      .set("Cookie", cookies)
      .send({ data: "test" });

    expect(postResponse.status).toBe(403);
  });

  it("should reject POST request with mismatched CSRF token", async () => {
    const getResponse = await request(app).get("/test-csrf-middleware");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];

    const postResponse = await request(app)
      .post("/test-csrf-middleware")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", "invalid-token")
      .send({ data: "test" });

    expect(postResponse.status).toBe(403);
  });
});
