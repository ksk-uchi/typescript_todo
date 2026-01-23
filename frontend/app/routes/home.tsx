import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Checkbox,
  Container,
  Fab,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { PaginationMeta, todoApi } from "../api/todoApi";
import PaginationControl from "../components/PaginationControl";
import TodoList from "../components/TodoList";
import TodoModal from "../components/TodoModal";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../types";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo App" },
    { name: "description", content: "Simple Todo App with React and MUI" },
  ];
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hideDone, setHideDone] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchTodos = async () => {
    try {
      const { todo: data, meta: newMeta } = await todoApi.getAll(
        !hideDone,
        page,
      );
      setTodos(data);
      setMeta(newMeta);
    } catch (error) {
      console.error("Failed to fetch todos", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [hideDone, page]);

  const handleCreate = async (data: CreateTodoDto) => {
    try {
      await todoApi.create(data);
      // Create後、最新の順序を反映するためリフェッチする
      await fetchTodos();
    } catch (error) {
      console.error("Failed to create todo", error);
    }
  };

  const handleUpdate = async (id: number, data: UpdateTodoDto) => {
    try {
      const updatedTodo = await todoApi.update(id, data);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error("Failed to update todo", error);
    }
  };

  const handleToggleStatus = async (id: number, is_done: boolean) => {
    try {
      await todoApi.updateDoneStatus(id, is_done);
      // ステータス更新で順序が変わる可能性があるため、リフェッチが安全だが、
      // ここではUX優先でローカル更新しつつ、必要ならリフェッチ
      // 今回の仕様変更で updated_at 順になるので、更新すると順序が変わるはず。
      // なのでリフェッチする。
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update todo status", error);
    }
  };

  const handleSave = async (data: CreateTodoDto | UpdateTodoDto) => {
    if (selectedTodo) {
      await handleUpdate(selectedTodo.id, data);
    } else {
      await handleCreate(data as CreateTodoDto);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todoApi.delete(id);
      // 削除後はページネーションの整合性を保つためリフェッチ
      await fetchTodos();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete todo", error);
    }
  };

  const openModal = (todo: Todo | null = null) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTodo(null);
    setIsModalOpen(false);
  };

  const handleHideDoneChange = (checked: boolean) => {
    setHideDone(checked);
    setPage(1); // Reset to page 1 when filter changes
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Todo List
      </Typography>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hideDone}
              onChange={(e) => handleHideDoneChange(e.target.checked)}
            />
          }
          label="Hide completed"
        />
      </Box>

      <TodoList
        todos={todos}
        onEdit={openModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {meta && (
        <PaginationControl
          currentPage={meta.currentPage}
          totalPage={meta.totalPage}
          onChange={setPage}
        />
      )}

      <Box sx={{ position: "fixed", bottom: 32, right: 32 }}>
        <Fab color="primary" aria-label="add" onClick={() => openModal(null)}>
          <AddIcon />
        </Fab>
      </Box>

      <TodoModal
        open={isModalOpen}
        todo={selectedTodo}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Container>
  );
}
