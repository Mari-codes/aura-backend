import { Router } from "express";
import { ProductsController } from "./products.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { requireAdmin } from "../../../shared/http/requireAdmin.js";

export const productsRoutes = Router();
const controller = new ProductsController();

productsRoutes.get("/", (req, res) =>
  controller.listPublic(req, res).catch((err) => res.status(400).json({ message: err.message }))
);

productsRoutes.get("/:id", (req, res) =>
  controller.getPublicById(req, res).catch((err) => res.status(404).json({ message: err.message }))
);

productsRoutes.post("/", requireAuth, requireAdmin, (req, res) =>
  controller.create(req, res).catch((err) => res.status(400).json({ message: err.message }))
);

productsRoutes.patch("/:id", requireAuth, requireAdmin, (req, res) =>
  controller.update(req, res).catch((err) => res.status(400).json({ message: err.message }))
);

productsRoutes.delete("/:id", requireAuth, requireAdmin, (req, res) =>
  controller.delete(req, res).catch((err) => res.status(400).json({ message: err.message }))
);