import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { todoStatusApi } from '../api/todoStatusApi';
import TodoStatusTable from '../components/TodoStatusTable';
import type { TodoStatus } from '../types';

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
        console.error('Fetch error:', err);
        setError('ステータス一覧の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

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
      <TodoStatusTable statuses={statuses} />
    </Container>
  );
}
