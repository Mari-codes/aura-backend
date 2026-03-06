import { Router } from "express";
import { UploadsController } from "./uploads.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { asyncHandler } from "../../../shared/http/asyncHandler.js";

export const uploadsRoutes = Router();

const controller = new UploadsController();

uploadsRoutes.post(
  "/presign",
  requireAuth,
  asyncHandler(controller.presign)
);