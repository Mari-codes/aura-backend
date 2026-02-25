import { ProductsRepository } from "../infra/products.repository.js";
import type { CreateProductInput, UpdateProductInput } from "../http/products.schemas.js";

const repo = new ProductsRepository();

export class ProductsService {
  listPublic() {
    return repo.listPublic();
  }

  async getPublicById(id: string) {
    const product = await repo.findById(id);
    if (!product || !product.isActive) throw new Error("Product not found");
    return product;
  }

  async create(data: CreateProductInput) {
    const existing = await repo.findBySlug(data.slug);
    if (existing) throw new Error("Slug already in use");
    return repo.create(data);
  }

  update(id: string, data: UpdateProductInput) {
    return repo.update(id, data);
  }

  delete(id: string) {
    return repo.delete(id);
  }
}