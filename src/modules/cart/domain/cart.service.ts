import { prisma } from "../../../shared/db/prisma.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { CartRepository } from "../infra/cart.repository.js";

export class CartService {
  constructor(private readonly repo = new CartRepository()) {}

  list(userId: string) {
    return this.repo.listByUser(userId);
  }

  async add(userId: string, productId: string, quantity: number) {
    const product = await this.getActiveProduct(productId);

    if (quantity > product.stock) {
      throw new AppError("Insufficient stock", 409, "INSUFFICIENT_STOCK");
    }

    const existing = await this.repo.findItem(userId, productId);
    const newQty = existing ? existing.quantity + quantity : quantity;

    if (newQty > product.stock) {
      throw new AppError("Insufficient stock", 409, "INSUFFICIENT_STOCK");
    }

    return this.repo.upsertItem(userId, productId, newQty);
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const product = await this.getActiveProduct(productId);

    if (quantity > product.stock) {
      throw new AppError("Insufficient stock", 409, "INSUFFICIENT_STOCK");
    }

    return this.repo.upsertItem(userId, productId, quantity);
  }

  async remove(userId: string, productId: string) {
    const existing = await this.repo.findItem(userId, productId);

    if (!existing) {
      throw new AppError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
    }

    await this.repo.deleteItem(userId, productId);
  }

  private async getActiveProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  }
}