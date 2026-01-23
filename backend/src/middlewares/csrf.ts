import type { NextFunction, Request, Response } from "express";

export const csrf = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET") {
    const token = crypto.randomUUID();
    res.cookie("_csrf", token, {
      httpOnly: false,
      secure: false, // In production, this should be true if using HTTPS
      sameSite: "lax",
    });
    next();
    return;
  }
  next();
};
