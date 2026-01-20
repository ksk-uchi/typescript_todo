import axios from "axios";
import type {
  CreateTodoStatusDto,
  TodoStatus,
  UpdateTodoStatusDto,
} from "../types";

const BASE_URL = "http://localhost:3000/todo_status";
const api = axios.create({
  baseURL: BASE_URL,
});

interface ListApiResponse {
  todoStatus: TodoStatus[];
}

export const todoStatusApi = {
  getAll: async (): Promise<TodoStatus[]> => {
    const response = await api.get<ListApiResponse>("/");
    // 優先度 (priority) の昇順でソート
    return response.data.todoStatus.sort((a, b) => a.priority - b.priority);
  },
  create: async (data: CreateTodoStatusDto): Promise<TodoStatus> => {
    const response = await api.post<{ todoStatus: TodoStatus }>("/", data);
    return response.data.todoStatus;
  },
  update: async (
    id: number,
    data: UpdateTodoStatusDto,
  ): Promise<TodoStatus> => {
    const response = await api.patch<{ todoStatus: TodoStatus }>(
      `/${id}`,
      data,
    );
    return response.data.todoStatus;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/${id}`);
  },
};
