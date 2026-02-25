import { Router } from "express";
import { ProductsController } from "./products.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { requireAdmin } from "../../../shared/http/requireAdmin.js";
import { asyncHandler } from "../../../shared/http/asyncHandler.js";

export const productsRoutes = Router();
const controller = new ProductsController();

productsRoutes.get("/", asyncHandler(controller.listPublic));
productsRoutes.get("/:id", asyncHandler(controller.getPublicById));

productsRoutes.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(controller.create)
);

productsRoutes.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(controller.update)
);

productsRoutes.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(controller.delete)
);