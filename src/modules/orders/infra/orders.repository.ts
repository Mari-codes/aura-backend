import { prisma } from "../../../shared/db/prisma.js";

export class OrdersRepository {
  createOrder(userId: string, items: Array<{
    productId: string;
    name: string;
    priceCents: number;
    quantity: number;
  }>) {
    const totalCents = items.reduce(
      (acc, item) => acc + item.priceCents * item.quantity,
      0
    );

    return prisma.order.create({
      data: {
        userId,
        totalCents,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            priceCents: i.priceCents,
            quantity: i.quantity
          }))
        }
      },
      include: { items: true }
    });
  }

  listByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
  }

  getById(userId: string, orderId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true }
    });
  }
}