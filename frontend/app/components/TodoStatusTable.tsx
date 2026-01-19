import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { TodoStatus } from "../types";

interface TodoStatusTableProps {
  statuses: TodoStatus[];
}

export default function TodoStatusTable({ statuses }: TodoStatusTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="todo status table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>ステータス名</TableCell>
            <TableCell>優先度</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statuses.map((status) => (
            <TableRow key={status.id} hover>
              <TableCell>{status.id}</TableCell>
              <TableCell>{status.displayName}</TableCell>
              <TableCell>{status.priority}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
