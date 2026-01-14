import { Express } from "express";
import { listTodoHandler, createTodoHandler } from "@/handlers/todoHandlers";

export const setTodoRoutes = (app: Express) => {
  app.get("/todos", listTodoHandler);
  app.post("/create_todo", createTodoHandler);
};
