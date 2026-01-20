import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";
import type { TodoStatus, UpdateTodoStatusDto } from "../types";

interface TodoStatusTableProps {
  statuses: TodoStatus[];
  onUpdate: (id: number, data: UpdateTodoStatusDto) => Promise<void>;
}

export default function TodoStatusTable({
  statuses,
  onUpdate,
}: TodoStatusTableProps) {
  const [editFormData, setEditFormData] = useState<
    Record<number, UpdateTodoStatusDto>
  >({});

  const handleEditClick = (status: TodoStatus) => {
    setEditFormData((prev) => ({
      ...prev,
      [status.id]: {
        displayName: status.displayName,
        priority: status.priority,
      },
    }));
  };

  const handleSaveClick = async (id: number) => {
    const data = editFormData[id];
    if (data) {
      await onUpdate(id, data);
      setEditFormData((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleChange = (
    id: number,
    field: keyof UpdateTodoStatusDto,
    value: string | number,
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="todo status table">
        <TableHead>
          <TableRow>
            <TableCell>ステータス名</TableCell>
            <TableCell>優先度</TableCell>
            <TableCell>アクション</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statuses.map((status) => {
            const isEditing = status.id in editFormData;
            const currentData = editFormData[status.id] || {};

            return (
              <TableRow key={status.id} hover>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={currentData.displayName || ""}
                      onChange={(e) =>
                        handleChange(status.id, "displayName", e.target.value)
                      }
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    status.displayName
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={currentData.priority ?? ""}
                      onChange={(e) =>
                        handleChange(
                          status.id,
                          "priority",
                          Number(e.target.value),
                        )
                      }
                      variant="standard"
                      size="small"
                      type="number"
                      fullWidth
                    />
                  ) : (
                    status.priority
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Button
                      variant="contained"
                      color="primary" // Success color is often primary or explicitly success in mui but standard contained is fine for now, user asked for save button
                      onClick={() => handleSaveClick(status.id)}
                      size="small"
                    >
                      保存
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => handleEditClick(status)}
                      size="small"
                    >
                      更新
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
