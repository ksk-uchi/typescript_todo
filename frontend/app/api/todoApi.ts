import axios from "axios";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../types";

const baseURL = "http://localhost:3000"; // Adjust based on actual backend URL if different

const api = axios.create({
  baseURL: baseURL,
});

type todoListApiResponse = {
  todo: Todo[];
};

export const todoApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await api.get<todoListApiResponse>("/todos");
    return response.data.todo;
  },

  getById: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/todo/${id}`);
    return response.data;
  },

  create: async (data: CreateTodoDto): Promise<Todo> => {
    const response = await api.post<Todo>("/create_todo", data);
    return response.data;
  },

  update: async (id: number, data: UpdateTodoDto): Promise<Todo> => {
    const response = await api.patch<Todo>(`/todo/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/todo/${id}`);
  },
};
