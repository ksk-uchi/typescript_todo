import { NextFunction, Request, Response } from "express";

export function allowOrigin(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token",
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
}
