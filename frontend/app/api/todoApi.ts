import axios from "axios";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../types";

const baseURL = "http://localhost:3000/todo";

const api = axios.create({
  baseURL: baseURL,
});

type todoListApiResponse = {
  todo: Todo[];
};

export const todoApi = {
  getAll: async (includeDone: boolean = false): Promise<Todo[]> => {
    const response = await api.get<todoListApiResponse>("/", {
      params: { include_done: includeDone },
    });
    return response.data.todo;
  },

  getById: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/${id}`);
    return response.data;
  },

  create: async (data: CreateTodoDto): Promise<Todo> => {
    const response = await api.post<Todo>("/", data);
    return response.data;
  },

  update: async (id: number, data: UpdateTodoDto): Promise<Todo> => {
    const response = await api.patch<Todo>(`/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/${id}`);
  },

  updateStatus: async (id: number, is_done: boolean): Promise<Todo> => {
    const response = await api.put<Todo>(`/done/${id}`, { is_done });
    return response.data;
  },
};
