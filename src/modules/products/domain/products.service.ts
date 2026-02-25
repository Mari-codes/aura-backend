import { AppError } from "../../../shared/errors/AppError.js";
import { ProductsRepository } from "../infra/products.repository.js";
import type {
  CreateProductInput,
  UpdateProductInput
} from "../http/products.schemas.js";

const repo = new ProductsRepository();

export class ProductsService {
  listPublic() {
    return repo.listPublic();
  }

  async getPublicById(id: string) {
    const product = await repo.findById(id);

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  }

  async create(data: CreateProductInput) {
    const existing = await repo.findBySlug(data.slug);

    if (existing) {
      throw new AppError("Slug already in use", 409, "SLUG_IN_USE");
    }

    return repo.create(data);
  }

  async update(id: string, data: UpdateProductInput) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugInUse = await repo.findBySlug(data.slug);

      if (slugInUse) {
        throw new AppError("Slug already in use", 409, "SLUG_IN_USE");
      }
    }

    return repo.update(id, data);
  }

  async delete(id: string) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    await repo.delete(id);
  }
}