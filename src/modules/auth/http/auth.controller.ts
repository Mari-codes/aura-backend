import type { Request, Response } from "express";
import { AuthService } from "../domain/auth.service.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);
    const token = await this.service.register(data);
    return res.status(201).json({ accessToken: token });
  };

  login = async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);
    const token = await this.service.login(data);
    return res.json({ accessToken: token });
  };
}