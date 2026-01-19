import axios from "axios";
import type { TodoStatus } from "../types";

const BASE_URL = "http://localhost:3000/todo_status";

interface ApiResponse {
  todoStatus: TodoStatus[];
}

export const todoStatusApi = {
  getAll: async (): Promise<TodoStatus[]> => {
    const response = await axios.get<ApiResponse>(`${BASE_URL}/`);
    // 優先度 (priority) の昇順でソート
    return response.data.todoStatus.sort((a, b) => a.priority - b.priority);
  },
};
