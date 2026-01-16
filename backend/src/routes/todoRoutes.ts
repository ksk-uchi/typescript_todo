import {
  createTodoHandler,
  deleteTodoHandler,
  detailTodoHandler,
  listTodoHandler,
  updateTodoHandler,
} from "@/handlers/todoHandlers";
import { Express } from "express";

export const setTodoRoutes = (app: Express) => {
  app.get("/todos", listTodoHandler);
  app.get("/todo/:todoId", detailTodoHandler);
  app.patch("/todo/:todoId", updateTodoHandler);
  app.delete("/todo/:todoId", deleteTodoHandler);
  app.post("/create_todo", createTodoHandler);
};
