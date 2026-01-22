import {
  createTodoHandler,
  deleteTodoHandler,
  detailTodoHandler,
  listTodoHandler,
  updateTodoHandler,
  updateTodoStatusHandler,
} from "@/handlers/todoHandlers";
import { Router } from "express";

const todoRouter = Router();
todoRouter.get("/", listTodoHandler);
todoRouter.post("/", createTodoHandler);
todoRouter.get("/:todoId", detailTodoHandler);
todoRouter.put("/done/:todoId", updateTodoStatusHandler);
todoRouter.patch("/:todoId", updateTodoHandler);
todoRouter.delete("/:todoId", deleteTodoHandler);

export default todoRouter;
