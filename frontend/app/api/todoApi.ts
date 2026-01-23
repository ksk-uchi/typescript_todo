import axios from "axios";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../types";

export interface PaginationMeta {
  totalCount: number;
  totalPage: number;
  currentPage: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GetTodoListResponse {
  todo: Todo[];
  meta: PaginationMeta;
}

const baseURL = "http://localhost:3000/todo";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  };
  const token = getCookie("_csrf");
  if (token) {
    config.headers["X-CSRF-Token"] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      window.location.href = "/?error=csrf";
    }
    return Promise.reject(error);
  },
);

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
