import { allowOrigin } from "@/middlewares/allowOrigin";
import errorHandler from "@/middlewares/errorHandler";
import { setAllRoutes } from "@/routes";
import express from "express";

export const app = express();

app.use(express.json());
app.use(allowOrigin);

setAllRoutes(app);

app.use(errorHandler);
