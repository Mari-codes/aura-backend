import type { Request, Response } from "express";
import { OrdersService } from "../domain/orders.service.js";

export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  checkout = async (req: Request, res: Response) => {
    const order = await this.service.checkout(req.userId as string);
    return res.status(201).json(order);
  };

  list = async (req: Request, res: Response) => {
    const orders = await this.service.list(req.userId as string);
    return res.json(orders);
  };

  getById = async (req: Request, res: Response) => {
    const orderId = String(req.params.id);
    const order = await this.service.get(req.userId as string, orderId);
    return res.json(order);
  };

  pay = async (req: Request, res: Response) => {
    const orderId = String(req.params.id);
    const order = await this.service.pay(req.userId as string, orderId);
    return res.json(order);
  };

  cancel = async (req: Request, res: Response) => {
    const orderId = String(req.params.id);
    const order = await this.service.cancel(req.userId as string, orderId);
    return res.json(order);
  };
}