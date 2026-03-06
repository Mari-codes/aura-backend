import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrdersService } from "./orders.service.js";
import { AppError } from "../../../shared/errors/AppError.js";

describe("OrdersService", () => {
  let repo: any;
  let prismaMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = {
      listByUser: vi.fn(),
      getById: vi.fn(),
    };

    prismaMock = {
      cartItem: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn(),
    };
  });

  it("throws 409 when cart is empty", async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([]);

    const service = new OrdersService(repo, prismaMock);
    const promise = service.checkout("u1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      code: "CART_EMPTY",
    });
  });

  it("get throws 404 when order does not exist", async () => {
    repo.getById.mockResolvedValue(null);

    const service = new OrdersService(repo, prismaMock);
    const promise = service.get("u1", "o1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  });

  it("throws 409 when stock is insufficient", async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([
      {
        productId: "p1",
        quantity: 5,
        product: {
          isActive: true,
          stock: 2,
          name: "Gloss",
          priceCents: 1000,
        },
      },
    ]);

    const service = new OrdersService(repo, prismaMock);
    const promise = service.checkout("u1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
    });
  });
});