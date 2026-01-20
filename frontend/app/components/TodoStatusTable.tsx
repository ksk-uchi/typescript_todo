import { Add as AddIcon } from "@mui/icons-material";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import type {
  CreateTodoStatusDto,
  TodoStatus,
  UpdateTodoStatusDto,
} from "../types";

interface TodoStatusTableProps {
  statuses: TodoStatus[];
  onUpdate: (id: number, data: UpdateTodoStatusDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (data: CreateTodoStatusDto) => Promise<void>;
}

export default function TodoStatusTable({
  statuses,
  onUpdate,
  onDelete,
  onCreate,
}: TodoStatusTableProps) {
  const [editFormData, setEditFormData] = useState<
    Record<number, UpdateTodoStatusDto>
  >({});
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState<
    Partial<CreateTodoStatusDto>
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

  const handleDeleteClick = async (id: number) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await onDelete(id);
    } catch {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
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

  const handleCreateChange = (
    field: keyof CreateTodoStatusDto,
    value: string | number,
  ) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddClick = () => {
    setIsCreating(true);
    setCreateFormData({});
  };

  const handleCreateSave = async () => {
    const { displayName, priority } = createFormData;

    if (!displayName || priority === undefined || priority === null) {
      alert("ステータス名と優先度は必須です。");
      return;
    }

    const isDuplicate = statuses.some((s) => s.priority === priority);
    if (isDuplicate) {
      alert(`Priority(${priority}) already exists`);
      return;
    }

    await onCreate({ displayName, priority });
    setIsCreating(false);
    setCreateFormData({});
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateFormData({});
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
            const isDeleting = deletingIds.has(status.id);

            return (
              <TableRow key={status.id} hover>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      disabled={isDeleting}
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
                      disabled={isDeleting}
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
                      color="primary"
                      onClick={() => handleSaveClick(status.id)}
                      size="small"
                      disabled={isDeleting}
                    >
                      保存
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => handleEditClick(status)}
                        size="small"
                        disabled={isDeleting}
                        sx={{ mr: 1 }}
                      >
                        更新
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(status.id)}
                        size="small"
                        disabled={isDeleting}
                      >
                        削除
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {isCreating && (
            <TableRow>
              <TableCell>
                <TextField
                  value={createFormData.displayName || ""}
                  onChange={(e) =>
                    handleCreateChange("displayName", e.target.value)
                  }
                  variant="standard"
                  size="small"
                  fullWidth
                  placeholder="ステータス名"
                  autoFocus
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={createFormData.priority ?? ""}
                  onChange={(e) =>
                    handleCreateChange("priority", Number(e.target.value))
                  }
                  variant="standard"
                  size="small"
                  type="number"
                  fullWidth
                  placeholder="優先度"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  onClick={handleCreateSave}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  保存
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancelCreate}
                  size="small"
                >
                  キャンセル
                </Button>
              </TableCell>
            </TableRow>
          )}

          <TableRow>
            <TableCell colSpan={3} align="center">
              <Tooltip title="新しいステータスを追加">
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleAddClick}
                    disabled={isCreating}
                  >
                    <AddIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
