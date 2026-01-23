import { csrf } from "@/middlewares/csrf";
import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(csrf);

  app.get("/test-csrf", (_, res) => {
    res.status(200).send("OK");
  });

  app.post("/test-csrf", (_, res) => {
    res.status(200).send("OK");
  });

  // Error handler middleware to catch CSRFError
  app.use(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next; // Use next to avoid unused variable error, or just ignore. Express require 4 args.
      if (err.name === "CSRFError") {
        res.status(403).send("Forbidden");
      } else {
        res.status(500).send("Internal Server Error");
      }
    },
  );

  return app;
};

describe("CSRF Middleware", () => {
  const app = createApp();

  it("should set _csrf cookie on GET request", async () => {
    const response = await request(app).get("/test-csrf");
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
    const getResponse = await request(app).get("/test-csrf");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];
    const csrfCookie = cookies.find((c: string) => c.startsWith("_csrf="));
    const token = csrfCookie?.split(";")[0].split("=")[1];

    expect(token).toBeDefined();

    // 2. Post with Token
    const postResponse = await request(app)
      .post("/test-csrf")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", token as string)
      .send({ data: "test" });

    expect(postResponse.status).toBe(200);
  });

  it("should reject POST request without CSRF token in header", async () => {
    // 1. Get Token
    const getResponse = await request(app).get("/test-csrf");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];

    // 2. Post without Header
    const postResponse = await request(app)
      .post("/test-csrf")
      .set("Cookie", cookies)
      .send({ data: "test" });

    expect(postResponse.status).toBe(403);
  });

  it("should reject POST request with mismatched CSRF token", async () => {
    const getResponse = await request(app).get("/test-csrf");
    const cookies = getResponse.headers["set-cookie"] as unknown as string[];

    const postResponse = await request(app)
      .post("/test-csrf")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", "invalid-token")
      .send({ data: "test" });

    expect(postResponse.status).toBe(403);
  });
});
