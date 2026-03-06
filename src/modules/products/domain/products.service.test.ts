import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductsService } from "./products.service.js";
import { AppError } from "../../../shared/errors/AppError.js";

type Repo = {
  listPublic: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findBySlug: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("ProductsService", () => {
  let repo: Repo;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = {
      listPublic: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("getPublicById throws 404 when product does not exist", async () => {
    repo.findById.mockResolvedValue(null);

    const service = new ProductsService(repo as any);
    const promise = service.getPublicById("p1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("getPublicById throws 404 when product is inactive", async () => {
    repo.findById.mockResolvedValue({ id: "p1", isActive: false });

    const service = new ProductsService(repo as any);
    const promise = service.getPublicById("p1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("create throws 409 when slug is already in use", async () => {
    repo.findBySlug.mockResolvedValue({ id: "p1", slug: "gloss" });

    const service = new ProductsService(repo as any);
    const promise = service.create({ slug: "gloss" } as any);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      code: "SLUG_IN_USE",
    });
  });

  it("create calls repo.create when slug is free", async () => {
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: "p1", slug: "gloss" });

    const service = new ProductsService(repo as any);
    const result = await service.create({ slug: "gloss" } as any);

    expect(repo.create).toHaveBeenCalledWith({ slug: "gloss" });
    expect(result).toEqual({ id: "p1", slug: "gloss" });
  });

  it("update throws 404 when product does not exist", async () => {
    repo.findById.mockResolvedValue(null);

    const service = new ProductsService(repo as any);
    const promise = service.update("p1", { name: "x" } as any);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("update throws 409 when changing slug to one already in use", async () => {
    repo.findById.mockResolvedValue({ id: "p1", slug: "old" });
    repo.findBySlug.mockResolvedValue({ id: "p2", slug: "new" });

    const service = new ProductsService(repo as any);
    const promise = service.update("p1", { slug: "new" } as any);

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      code: "SLUG_IN_USE",
    });
  });

  it("update calls repo.update when slug is unchanged", async () => {
    repo.findById.mockResolvedValue({ id: "p1", slug: "same" });
    repo.update.mockResolvedValue({ id: "p1", slug: "same", name: "New" });

    const service = new ProductsService(repo as any);
    const result = await service.update("p1", { name: "New", slug: "same" } as any);

    expect(repo.update).toHaveBeenCalledWith("p1", { name: "New", slug: "same" });
    expect(result).toEqual({ id: "p1", slug: "same", name: "New" });
  });

  it("delete throws 404 when product does not exist", async () => {
    repo.findById.mockResolvedValue(null);

    const service = new ProductsService(repo as any);
    const promise = service.delete("p1");

    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("delete calls repo.delete when product exists", async () => {
    repo.findById.mockResolvedValue({ id: "p1" });
    repo.delete.mockResolvedValue(undefined);

    const service = new ProductsService(repo as any);
    await service.delete("p1");

    expect(repo.delete).toHaveBeenCalledWith("p1");
  });
});