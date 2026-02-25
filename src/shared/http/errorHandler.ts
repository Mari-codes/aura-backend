import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid request",
      issues: err.issues,
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error(err);
    }

    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error",
  });
}
