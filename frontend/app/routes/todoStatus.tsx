import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { todoStatusApi } from "../api/todoStatusApi";
import TodoStatusTable from "../components/TodoStatusTable";
import type {
  CreateTodoStatusDto,
  TodoStatus,
  UpdateTodoStatusDto,
} from "../types";

export default function TodoStatusList() {
  const [statuses, setStatuses] = useState<TodoStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await todoStatusApi.getAll();
        setStatuses(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("ステータス一覧の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleUpdate = async (id: number, data: UpdateTodoStatusDto) => {
    try {
      const updatedStatus = await todoStatusApi.update(id, data);
      setStatuses((prevStatuses) =>
        prevStatuses.map((status) =>
          status.id === id ? updatedStatus : status,
        ),
      );
    } catch (err) {
      console.error("Update error:", err);
      // Optionally set an error state here or show a notification
      alert("ステータスの更新に失敗しました。");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todoStatusApi.delete(id);
      setStatuses((prevStatuses) =>
        prevStatuses.filter((status) => status.id !== id),
      );
    } catch (err) {
      console.error("Delete error:", err);
      alert("ステータスの削除に失敗しました。");
      throw err; // Re-throw to let Table know functionality failed
    }
  };

  const handleCreate = async (data: CreateTodoStatusDto) => {
    try {
      const newStatus = await todoStatusApi.create(data);
      setStatuses((prevStatuses) => [...prevStatuses, newStatus]);
    } catch (err: any) {
      console.error("Create error:", err);
      if (err.response?.data?.fieldErrors?.priority) {
        alert(err.response.data.fieldErrors.priority[0]);
      } else {
        alert("ステータスの作成に失敗しました。");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ステータス一覧
      </Typography>
      <TodoStatusTable
        statuses={statuses}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />
    </Container>
  );
}
