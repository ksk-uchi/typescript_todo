import {
  createTodoHandler,
  detailTodoHandler,
  listTodoHandler,
} from "@/handlers/todoHandlers";
import { Express } from "express";

export const setTodoRoutes = (app: Express) => {
  app.get("/todos", listTodoHandler);
  app.get("/todo/:todoId", detailTodoHandler);
  app.post("/create_todo", createTodoHandler);
};
