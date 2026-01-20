import axios from "axios";
import type {
  CreateTodoStatusDto,
  TodoStatus,
  UpdateTodoStatusDto,
} from "../types";

const BASE_URL = "http://localhost:3000/todo_status";

interface ListApiResponse {
  todoStatus: TodoStatus[];
}

export const todoStatusApi = {
  getAll: async (): Promise<TodoStatus[]> => {
    const response = await axios.get<ListApiResponse>(`${BASE_URL}/`);
    // 優先度 (priority) の昇順でソート
    return response.data.todoStatus.sort((a, b) => a.priority - b.priority);
  },
  update: async (
    id: number,
    data: UpdateTodoStatusDto,
  ): Promise<TodoStatus> => {
    const response = await axios.patch<{ todoStatus: TodoStatus }>(
      `${BASE_URL}/${id}`,
      data,
    );
    return response.data.todoStatus;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
  create: async (data: CreateTodoStatusDto): Promise<TodoStatus> => {
    const response = await axios.post<{ todoStatus: TodoStatus }>(
      `${BASE_URL}/`,
      data,
    );
    return response.data.todoStatus;
  },
};
