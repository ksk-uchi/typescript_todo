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
  const TEST_TOKEN = "test-csrf-token-123";
  const TEST_COOKIE = `_csrf=${TEST_TOKEN}`;

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
    const response = await request(app)
      .post("/test-csrf-middleware")
      .set("Cookie", [TEST_COOKIE])
      .set("X-CSRF-Token", TEST_TOKEN)
      .send({ data: "test" });

    expect(response.status).toBe(200);
  });

  it("should reject POST request without CSRF token in header", async () => {
    const response = await request(app)
      .post("/test-csrf-middleware")
      .set("Cookie", [TEST_COOKIE])
      .send({ data: "test" });

    expect(response.status).toBe(403);
  });

  it("should reject POST request with mismatched CSRF token", async () => {
    const response = await request(app)
      .post("/test-csrf-middleware")
      .set("Cookie", [TEST_COOKIE])
      .set("X-CSRF-Token", "invalid-token")
      .send({ data: "test" });

    expect(response.status).toBe(403);
  });
});
