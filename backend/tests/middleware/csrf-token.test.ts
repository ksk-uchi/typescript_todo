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
});
