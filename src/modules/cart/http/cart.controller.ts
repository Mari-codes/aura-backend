import type { Request, Response } from "express";
import { CartService } from "../domain/cart.service.js";
import { addToCartSchema, updateCartItemSchema } from "./cart.schemas.js";

const service = new CartService();

export class CartController {
  list = async (req: Request, res: Response) => {
    const items = await service.list(req.userId as string);
    return res.json(items);
  };

  add = async (req: Request, res: Response) => {
    const data = addToCartSchema.parse(req.body);
    const item = await service.add(req.userId as string, data.productId, data.quantity);
    return res.status(201).json(item);
  };

  update = async (req: Request, res: Response) => {
    const productId = String(req.params.productId);
    const data = updateCartItemSchema.parse(req.body);
    const item = await service.updateQuantity(req.userId as string, productId, data.quantity);
    return res.json(item);
  };

  remove = async (req: Request, res: Response) => {
    const productId = String(req.params.productId);
    await service.remove(req.userId as string, productId);
    return res.status(204).send();
  };
}