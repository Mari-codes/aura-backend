import type { Request, Response } from "express";
import { OrdersService } from "../domain/orders.service.js";

const service = new OrdersService();

export class OrdersController {
  checkout = async (req: Request, res: Response) => {
    const order = await service.checkout(req.userId as string);
    return res.status(201).json(order);
  };

  list = async (req: Request, res: Response) => {
    const orders = await service.list(req.userId as string);
    return res.json(orders);
  };

  getById = async (req: Request, res: Response) => {
    const orderId = String(req.params.id);
    const order = await service.get(req.userId as string, orderId);
    return res.json(order);
  };

  pay = async (req: Request, res: Response) => {
    const orderId = String(req.params.id);
    const order = await service.pay(req.userId as string, orderId);
    return res.json(order);
  };

  cancel = async (req: Request, res: Response) => {
    const orderId = String(req.params.id);
    const order = await service.cancel(req.userId as string, orderId);
    return res.json(order);
  };
}
