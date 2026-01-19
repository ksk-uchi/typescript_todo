import {
  createTodoHandler,
  deleteTodoHandler,
  detailTodoHandler,
  listTodoHandler,
  updateTodoHandler,
} from "@/handlers/todoHandlers";
import { listTodoStatusHandler } from "@/handlers/todoStatusHandlers";
import { Express, NextFunction, Request, Response, Router } from "express";

export const allowOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
};

export const setTodoRoutes = (app: Express) => {
  app.use(allowOrigin);
  app.get("/todos", listTodoHandler);
  app.get("/todo/:todoId", detailTodoHandler);
  app.patch("/todo/:todoId", updateTodoHandler);
  app.delete("/todo/:todoId", deleteTodoHandler);
  app.post("/create_todo", createTodoHandler);
  const todoStatusRouter = Router();
  app.use("/todo_status", todoStatusRouter);
  todoStatusRouter.get("/", listTodoStatusHandler);
};
