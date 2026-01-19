import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { Todo } from "../types";

interface TodoListProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, onEdit, onDelete }: TodoListProps) {
  return (
    <Paper elevation={2}>
      <List>
        {todos.map((todo) => (
          <ListItem
            key={todo.id}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => onEdit(todo)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(todo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
            disablePadding
          >
            <ListItemText primary={todo.title} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
