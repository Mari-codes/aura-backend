import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersRepository } from "../../users/infra/users.repository.js";
import { RegisterInput, LoginInput } from "../http/auth.schemas.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { env } from "../../../shared/config/env.js";

export class AuthService {
  constructor(
    private readonly usersRepository = new UsersRepository(),
    private readonly bcryptLib = bcrypt,
    private readonly jwtLib = jwt,
  ) {}

  async register(data: RegisterInput) {
    const existingUser = await this.usersRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already in use", 409, "EMAIL_IN_USE");
    }

    const passwordHash = await this.bcryptLib.hash(data.password, 10);

    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    return this.generateToken(user.id);
  }

  async login(data: LoginInput) {
    const user = await this.usersRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const passwordMatch = await this.bcryptLib.compare(
      data.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    return this.jwtLib.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
  }
}
