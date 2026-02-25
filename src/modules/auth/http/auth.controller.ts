import type { Request, Response } from "express";
import { AuthService } from "../domain/auth.service.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    const token = await service.register(data);
    return res.status(201).json({ accessToken: token });
  }

  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const token = await service.login(data);
    return res.json({ accessToken: token });
  }
}