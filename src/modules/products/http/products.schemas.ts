import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0),

  imageKey: z.string().startsWith("products/").optional(),

  isActive: z.boolean().optional()
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;