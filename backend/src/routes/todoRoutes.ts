import {
  createTodoHandler,
  detailTodoHandler,
  listTodoHandler,
  updateTodoHandler,
} from "@/handlers/todoHandlers";
import { Express } from "express";

export const setTodoRoutes = (app: Express) => {
  app.get("/todos", listTodoHandler);
  app.get("/todo/:todoId", detailTodoHandler);
  app.patch("/todo/:todoId", updateTodoHandler);
  app.post("/create_todo", createTodoHandler);
};
