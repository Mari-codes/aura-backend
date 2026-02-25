import { prisma } from "../../../shared/db/prisma.js";
import { CartRepository } from "../infra/cart.repository.js";

const repo = new CartRepository();

export class CartService {
  list(userId: string) {
    return repo.listByUser(userId);
  }

  async add(userId: string, productId: string, quantity: number) {
    const product = await this.getActiveProduct(productId);

    if (quantity > product.stock) {
      throw new Error("Insufficient stock");
    }

    const existing = await repo.findItem(userId, productId);

    const newQty = existing ? existing.quantity + quantity : quantity;

    if (newQty > product.stock) {
      throw new Error("Insufficient stock");
    }

    return repo.upsertItem(userId, productId, newQty);
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const product = await this.getActiveProduct(productId);

    if (quantity > product.stock) {
      throw new Error("Insufficient stock");
    }

    return repo.upsertItem(userId, productId, quantity);
  }

  remove(userId: string, productId: string) {
    return repo.deleteItem(userId, productId);
  }

  private async getActiveProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new Error("Product not found");
    return product;
  }
}