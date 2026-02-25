import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma.js";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}