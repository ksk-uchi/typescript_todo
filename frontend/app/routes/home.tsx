import AddIcon from "@mui/icons-material/Add";
import { Box, Container, Fab, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { todoApi } from "../api/todoApi";
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

  const fetchTodos = async () => {
    try {
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreate = async (data: CreateTodoDto) => {
    try {
      const newTodo = await todoApi.create(data);
      setTodos([...todos, newTodo]);
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
      setTodos(todos.filter((t) => t.id !== id));
      setIsModalOpen(false); // Ensure modal is closed if deleting from modal
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Todo List
      </Typography>

      <TodoList todos={todos} onEdit={openModal} onDelete={handleDelete} />

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
