import {
  createTodoStatusHandler,
  deleteTodoStatusHandler,
  listTodoStatusHandler,
  updateTodoStatusHandler,
} from "@/handlers/todoStatusHandlers";
import { Router } from "express";

const todoStatusRouter = Router();
todoStatusRouter.get("/", listTodoStatusHandler);
todoStatusRouter.post("/", createTodoStatusHandler);
todoStatusRouter.patch("/:todoStatusId", updateTodoStatusHandler);
todoStatusRouter.delete("/:todoStatusId", deleteTodoStatusHandler);

export default todoStatusRouter;
