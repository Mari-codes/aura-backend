import { Router } from "express";
import { CartController } from "./cart.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { asyncHandler } from "../../../shared/http/asyncHandler.js";

export const cartRoutes = Router();
const controller = new CartController();

cartRoutes.use(requireAuth);

cartRoutes.get("/", asyncHandler(controller.list));
cartRoutes.post("/items", asyncHandler(controller.add));
cartRoutes.patch("/items/:productId", asyncHandler(controller.update));
cartRoutes.delete("/items/:productId", asyncHandler(controller.remove));