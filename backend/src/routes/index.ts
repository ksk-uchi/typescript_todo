import todoRouter from "@/routes/todoRoutes";
import { Express } from "express";

export const setAllRoutes = (app: Express) => {
  app.use("/todo", todoRouter);
};
