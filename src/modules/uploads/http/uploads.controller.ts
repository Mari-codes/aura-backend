import { Request, Response } from "express";
import { UploadsService } from "../domain/uploads.service.js";
import { presignSchema } from "./uploads.schemas.js";

export class UploadsController {
  constructor(private service = new UploadsService()) {}

  presign = async (req: Request, res: Response) => {
    const { productId, filename, contentType } = presignSchema.parse(req.body);

    const result = await this.service.createPresignedUpload(
      productId,
      filename,
      contentType
    );

    return res.json(result);
  };
}