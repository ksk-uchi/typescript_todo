import todoRouter from "@/routes/todoRoutes";
import todoStatusRouter from "@/routes/todoStatusRoutes";
import { Express } from "express";

export const setAllRoutes = (app: Express) => {
  app.use("/todo", todoRouter);
  app.use("/todo_status", todoStatusRouter);
};
