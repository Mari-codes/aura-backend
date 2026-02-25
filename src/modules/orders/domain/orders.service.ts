import { prisma as prismaClient } from "../../../shared/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { OrdersRepository } from "../infra/orders.repository.js";

export class OrdersService {
  constructor(
    private readonly repo = new OrdersRepository(),
    private readonly prisma = prismaClient
  ) {}

  async checkout(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new AppError("Cart is empty", 409, "CART_EMPTY");
    }

    for (const item of cartItems) {
      if (!item.product.isActive) {
        throw new AppError("Product not available", 409, "PRODUCT_NOT_AVAILABLE");
      }

      if (item.quantity > item.product.stock) {
        throw new AppError("Insufficient stock", 409, "INSUFFICIENT_STOCK");
      }
    }

    return this.prisma.$transaction(async (tx: any) => {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const snapshotItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        priceCents: item.product.priceCents,
        quantity: item.quantity,
      }));

      const totalCents = snapshotItems.reduce(
        (acc, i) => acc + i.priceCents * i.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          items: { create: snapshotItems },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  list(userId: string) {
    return this.repo.listByUser(userId);
  }

  async get(userId: string, orderId: string) {
    const order = await this.repo.getById(userId, orderId);

    if (!order) {
      throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    return order;
  }

  async pay(userId: string, orderId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });

      if (!order) {
        throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
      }

      if (order.status !== "PENDING") {
        throw new AppError("Order cannot be paid", 409, "ORDER_STATE_INVALID");
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        include: { items: true },
      });
    });
  }

  async cancel(userId: string, orderId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });

      if (!order) {
        throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
      }

      if (order.status !== "PENDING") {
        throw new AppError("Order cannot be canceled", 409, "ORDER_STATE_INVALID");
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELED" },
        include: { items: true },
      });
    });
  }
}