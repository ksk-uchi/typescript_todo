import { NextFunction, Request, Response } from "express";

export function allowOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  // In production, you would check against an allowed list of origins.
  // For this demo/task, we dynamically reflect the origin.
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}
