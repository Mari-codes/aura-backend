import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../../shared/http/requireAuth.js";
import { requireAdmin } from "../../../shared/http/requireAdmin.js";
import { asyncHandler } from "../../../shared/http/asyncHandler.js";

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post("/register", asyncHandler(controller.register));
authRoutes.post("/login", asyncHandler(controller.login));

authRoutes.get("/me", requireAuth, (req, res) => {
  return res.json({ userId: req.userId });
});

authRoutes.get(
  "/admin-test",
  requireAuth,
  requireAdmin,
  (req, res) => {
    return res.json({
      message: "You are an admin",
      userId: req.userId
    });
  }
);