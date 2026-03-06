import { prisma } from "../../../shared/db/prisma.js";
import type { Prisma } from "@prisma/client";

export class ProductsRepository {
  listPublic() {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
  }

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
