import type { Request, Response } from "express";
import { ProductsService } from "../domain/products.service.js";
import { createProductSchema, updateProductSchema } from "./products.schemas.js";

export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  listPublic = async (_req: Request, res: Response) => {
    const items = await this.service.listPublic();
    return res.json(items);
  };

  getPublicById = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const item = await this.service.getPublicById(id);
    return res.json(item);
  };

  create = async (req: Request, res: Response) => {
    const data = createProductSchema.parse(req.body);
    const created = await this.service.create(data);
    return res.status(201).json(created);
  };

  update = async (req: Request, res: Response) => {
    const data = updateProductSchema.parse(req.body);
    const id = String(req.params.id);
    const updated = await this.service.update(id, data);
    return res.json(updated);
  };

  delete = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await this.service.delete(id);
    return res.status(204).send();
  };
}