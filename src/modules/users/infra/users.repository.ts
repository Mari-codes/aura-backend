import { prisma } from "../../../shared/db/prisma.js";

export class UsersRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.user.create({
      data
    });
  }
}