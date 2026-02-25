import { prisma } from "../../../shared/db/prisma.js";
import { OrdersRepository } from "../infra/orders.repository.js";

const repo = new OrdersRepository();

export class OrdersService {
  async checkout(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    for (const item of cartItems) {
      if (!item.product.isActive) throw new Error("Product not available");
      if (item.quantity > item.product.stock) throw new Error("Insufficient stock");
    }

    return prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      const snapshotItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        priceCents: item.product.priceCents,
        quantity: item.quantity
      }));

      const totalCents = snapshotItems.reduce(
        (acc, i) => acc + i.priceCents * i.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          items: {
            create: snapshotItems
          }
        },
        include: { items: true }
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  list(userId: string) {
    return repo.listByUser(userId);
  }

  async get(userId: string, orderId: string) {
    const order = await repo.getById(userId, orderId);
    if (!order) throw new Error("Order not found");
    return order;
  }

  async pay(userId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") throw new Error("Order cannot be paid");

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { items: true }
    });

    return updated;
  });
}

async cancel(userId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") throw new Error("Order cannot be canceled");

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELED" },
      include: { items: true }
    });

    return updated;
  });
}
}