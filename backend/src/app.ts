import { allowOrigin } from "@/middlewares/allowOrigin";
import { csrf } from "@/middlewares/csrf";
import errorHandler from "@/middlewares/errorHandler";
import { setAllRoutes } from "@/routes";
import cookieParser from "cookie-parser";
import express from "express";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(allowOrigin);
app.use(csrf);

setAllRoutes(app);

app.use(errorHandler);
