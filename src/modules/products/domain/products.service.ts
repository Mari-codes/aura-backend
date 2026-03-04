import { AppError } from "../../../shared/errors/AppError.js";
import { env } from "../../../shared/config/env.js";
import { ProductsRepository } from "../infra/products.repository.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../http/products.schemas.js";

export class ProductsService {
  constructor(private readonly repo = new ProductsRepository()) {}

  listPublic() {
    return this.repo.listPublic();
  }

  async getPublicById(id: string) {
    const product = await this.repo.findById(id);

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  }

  async create(data: CreateProductInput) {
    const existing = await this.repo.findBySlug(data.slug);

    if (existing) {
      throw new AppError("Slug already in use", 409, "SLUG_IN_USE");
    }

    const imageUrl = data.imageKey
      ? `${env.AWS_S3_PUBLIC_BASE_URL}/${data.imageKey}?v=${Date.now()}`
      : undefined;

    return this.repo.create({
      ...data,
      ...(imageUrl ? { imageUrl } : {}),
    });
  }

  async update(id: string, data: UpdateProductInput) {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugInUse = await this.repo.findBySlug(data.slug);

      if (slugInUse) {
        throw new AppError("Slug already in use", 409, "SLUG_IN_USE");
      }
    }

    const imageUrl = data.imageKey
      ? `${env.AWS_S3_PUBLIC_BASE_URL}/${data.imageKey}?v=${Date.now()}`
      : undefined;

    return this.repo.update(id, {
      ...data,
      ...(data.imageKey ? { imageUrl } : {}),
    });
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    await this.repo.delete(id);
  }
}
