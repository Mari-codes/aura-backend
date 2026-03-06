import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartService } from "./cart.service.js";
import { AppError } from "../../../shared/errors/AppError.js";

vi.mock("../../../shared/db/prisma.js", () => {
  return {
    prisma: {
      product: {
        findUnique: vi.fn(),
      },
    },
  };
});

import { prisma } from "../../../shared/db/prisma.js";

describe("CartService", () => {
  let repo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = {
      listByUser: vi.fn(),
      findItem: vi.fn(),
      upsertItem: vi.fn(),
      deleteItem: vi.fn(),
    };
  });

  it("throws 409 when quantity exceeds stock", async () => {
    (prisma.product.findUnique as any).mockResolvedValue({
      id: "p1",
      isActive: true,
      stock: 2,
    });

    repo.findItem.mockResolvedValue(null);

    const service = new CartService(repo);
    const promise = service.add("u1", "p1", 3);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
    });
  });

  it("throws 404 when product does not exist", async () => {
    (prisma.product.findUnique as any).mockResolvedValue(null);

    const service = new CartService(repo);
    const promise = service.add("u1", "p1", 1);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("remove throws 404 when cart item does not exist", async () => {
    repo.findItem.mockResolvedValue(null);

    const service = new CartService(repo);
    const promise = service.remove("u1", "p1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "CART_ITEM_NOT_FOUND",
    });
  });

  it("calls upsertItem with accumulated quantity", async () => {
    (prisma.product.findUnique as any).mockResolvedValue({
      id: "p1",
      isActive: true,
      stock: 10,
    });

    repo.findItem.mockResolvedValue({ quantity: 2 });
    repo.upsertItem.mockResolvedValue({});

    const service = new CartService(repo);
    await service.add("u1", "p1", 3);

    expect(repo.upsertItem).toHaveBeenCalledWith("u1", "p1", 5);
  });

  it("remove calls deleteItem when item exists", async () => {
    repo.findItem.mockResolvedValue({ quantity: 1 });
    repo.deleteItem.mockResolvedValue(undefined);

    const service = new CartService(repo);
    await service.remove("u1", "p1");

    expect(repo.deleteItem).toHaveBeenCalledWith("u1", "p1");
  });
});