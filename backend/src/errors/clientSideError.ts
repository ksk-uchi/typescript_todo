import { ZodError } from "zod";

export class ClientSideError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ClientSideError";
    this.status = status;
  }
}

export class NotFoundError extends ClientSideError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ClientSideError {
  targets: Record<string, string>;
  constructor(message: string, errorItems: ZodError | Record<string, string>) {
    let targets: Record<string, string> = {};
    if (errorItems instanceof ZodError) {
      errorItems.issues.forEach((issue) => {
        issue.path.forEach((path) => {
          targets[path.toString()] = issue.code;
        });
      });
    } else {
      targets = errorItems;
    }
    super(message, 422);
    this.name = "ValidationError";
    this.targets = targets;
  }
}

export class CSRFError extends ClientSideError {
  constructor(message = "CSRF Token Mismatch") {
    super(message, 403);
    this.name = "CSRFError";
  }
}
