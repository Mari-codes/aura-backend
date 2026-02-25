import { Router } from "express";
import { OrdersController } from "./orders.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { asyncHandler } from "../../../shared/http/asyncHandler.js";

export const ordersRoutes = Router();
const controller = new OrdersController();

ordersRoutes.use(requireAuth);

ordersRoutes.post("/", asyncHandler(controller.checkout));
ordersRoutes.get("/", asyncHandler(controller.list));
ordersRoutes.get("/:id", asyncHandler(controller.getById));

ordersRoutes.post("/:id/pay", asyncHandler(controller.pay));
ordersRoutes.post("/:id/cancel", asyncHandler(controller.cancel));