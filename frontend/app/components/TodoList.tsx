import DeleteIcon from "@mui/icons-material/Delete";
import {
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import type { Todo } from "../types";

interface TodoListProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, is_done: boolean) => void;
}

export default function TodoList({
  todos,
  onEdit,
  onDelete,
  onToggleStatus,
}: TodoListProps) {
  return (
    <Paper elevation={2}>
      <List>
        {todos.map((todo) => {
          const isDone = !!todo.done_at;
          return (
            <ListItem
              key={todo.id}
              secondaryAction={
                !isDone && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDelete(todo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )
              }
              disablePadding
            >
              <ListItemButton dense onClick={() => onEdit(todo)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isDone}
                    disableRipple
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onToggleStatus(todo.id, e.target.checked)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={todo.title}
                  sx={{
                    textDecoration: isDone ? "line-through" : "none",
                    color: isDone ? "text.disabled" : "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
