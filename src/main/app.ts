import express from "express";
import cors from "cors";
import { mainRouter } from "./routes.js";
import { errorHandler } from "../shared/http/errorHandler.js";
import { env } from "../shared/config/env.js";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/v1", mainRouter);

app.get("/health", (_req, res) => res.json({ ok: true, name: "AURA" }));

app.use(errorHandler);
