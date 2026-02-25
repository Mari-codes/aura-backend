import { Router } from "express";
import { OrdersController } from "./orders.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";

export const ordersRoutes = Router();
const controller = new OrdersController();

ordersRoutes.use(requireAuth);

ordersRoutes.post("/", (req, res) =>
  controller.checkout(req, res).catch((err) =>
    res.status(400).json({ message: err.message })
  )
);

ordersRoutes.get("/", (req, res) =>
  controller.list(req, res).catch((err) =>
    res.status(400).json({ message: err.message })
  )
);

ordersRoutes.get("/:id", (req, res) =>
  controller.getById(req, res).catch((err) =>
    res.status(404).json({ message: err.message })
  )
);

ordersRoutes.post("/:id/pay", (req, res) =>
  controller.pay(req, res).catch((err) =>
    res.status(400).json({ message: err.message })
  )
);

ordersRoutes.post("/:id/cancel", (req, res) =>
  controller.cancel(req, res).catch((err) =>
    res.status(400).json({ message: err.message })
  )
);