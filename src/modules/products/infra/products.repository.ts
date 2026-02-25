import { prisma } from "../../../shared/db/prisma.js";
import type { CreateProductInput, UpdateProductInput } from "../http/products.schemas.js";

export class ProductsRepository {
  listPublic() {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
  }

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
  }

  create(data: CreateProductInput) {
    return prisma.product.create({ data });
  }

  update(id: string, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}