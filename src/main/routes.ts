import { Router } from "express";
import { authRoutes } from "../modules/auth/http/auth.routes.js";
import { productsRoutes } from "../modules/products/http/products.routes.js";
import { cartRoutes } from "../modules/cart/http/cart.routes.js";
import { ordersRoutes } from "../modules/orders/http/orders.routes.js";

export const mainRouter = Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/products", productsRoutes);
mainRouter.use("/cart", cartRoutes);
mainRouter.use("/orders", ordersRoutes);