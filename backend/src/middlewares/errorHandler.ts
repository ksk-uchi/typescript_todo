import { ClientSideError, ValidationError } from "@/errors/clientSideError";
import { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err instanceof ValidationError) {
    return res
      .status(err.status)
      .json({ message: err.message, targets: err.targets });
  }

  if (err instanceof CSRFError) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (err instanceof ClientSideError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
