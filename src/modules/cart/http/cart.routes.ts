import { Router } from "express";
import { CartController } from "./cart.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";

export const cartRoutes = Router();
const controller = new CartController();

cartRoutes.use(requireAuth);

cartRoutes.get("/", (req, res) =>
  controller.list(req, res).catch((err) => res.status(400).json({ message: err.message }))
);

cartRoutes.post("/items", (req, res) =>
  controller.add(req, res).catch((err) => res.status(400).json({ message: err.message }))
);

cartRoutes.patch("/items/:productId", (req, res) =>
  controller.update(req, res).catch((err) => res.status(400).json({ message: err.message }))
);

cartRoutes.delete("/items/:productId", (req, res) =>
  controller.remove(req, res).catch((err) => res.status(400).json({ message: err.message }))
);