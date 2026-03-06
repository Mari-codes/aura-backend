import { prisma } from "../../../shared/db/prisma.js";

export class CartRepository {
  listByUser(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
  }

  findItem(userId: string, productId: string) {
    return prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } }
    });
  }

  upsertItem(userId: string, productId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity },
      include: { product: true }
    });
  }

  deleteItem(userId: string, productId: string) {
    return prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } }
    });
  }
}