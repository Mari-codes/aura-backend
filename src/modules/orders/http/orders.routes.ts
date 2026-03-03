import { Router } from "express";
import { OrdersController } from "./orders.controller.js";
import { OrdersService } from "../domain/orders.service.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { asyncHandler } from "../../../shared/http/asyncHandler.js";

export const ordersRoutes = Router();

ordersRoutes.use(requireAuth);

const service = new OrdersService();
const controller = new OrdersController(service);

ordersRoutes.post("/", asyncHandler(controller.checkout));
ordersRoutes.get("/", asyncHandler(controller.list));
ordersRoutes.get("/:id", asyncHandler(controller.getById));
ordersRoutes.post("/:id/pay", asyncHandler(controller.pay));
ordersRoutes.post("/:id/cancel", asyncHandler(controller.cancel));