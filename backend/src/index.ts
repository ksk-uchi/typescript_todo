import { allowOrigin } from "@/middlewares/allowOrigin";
import { setAllRoutes } from "@/routes";
import express from "express";

const app = express();
app.use(express.json());
app.use(allowOrigin);

setAllRoutes(app);

app.listen(3000, () => console.log("Server running on port 3000"));
