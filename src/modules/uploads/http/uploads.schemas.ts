import { z } from "zod";

export const presignSchema = z.object({
  productId: z.string().min(5),
  filename: z.string().min(1),
  contentType: z.string().min(3),
});

export type PresignInput = z.infer<typeof presignSchema>;