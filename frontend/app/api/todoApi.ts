import axios from "axios";
import type {
  CreateTodoDto,
  GetTodoListResponse,
  Todo,
  UpdateTodoDto,
} from "../types";

const baseURL = "http://localhost:3000/todo";

const api = axios.create({
  baseURL: baseURL,
});

export const todoApi = {
  getAll: async (
    includeDone: boolean = false,
    page: number = 1,
    items_per_page: number = 20,
  ): Promise<GetTodoListResponse> => {
    const response = await api.get<GetTodoListResponse>("/", {
      params: { include_done: includeDone, page, items_per_page },
    });
    return response.data;
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

  updateDoneStatus: async (id: number, is_done: boolean): Promise<Todo> => {
    const response = await api.put<Todo>(`/done/${id}`, { is_done });
    return response.data;
  },
};
