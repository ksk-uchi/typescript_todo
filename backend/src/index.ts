import express from "express";
import { setTodoRoutes } from "@/routes/todoRoutes";

const app = express();
app.use(express.json());

setTodoRoutes(app);

app.listen(3000, () => console.log("Server running on port 3000"));
