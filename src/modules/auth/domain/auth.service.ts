import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { UsersRepository } from "../../users/infra/users.repository.js";
import { RegisterInput, LoginInput } from "../http/auth.schemas.js";
import { AppError } from "../../../shared/errors/AppError.js";

const usersRepository = new UsersRepository();

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await usersRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already in use", 409, "EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash
    });

    return this.generateToken(user.id);
  }

  async login(data: LoginInput) {
    const user = await usersRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    const secret = process.env.JWT_ACCESS_SECRET;
    const expiresIn =
      process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"];

    if (!secret) {
      throw new AppError("JWT secret not configured", 500, "JWT_SECRET_MISSING");
    }

    return jwt.sign({ sub: userId }, secret, { expiresIn });
  }
}