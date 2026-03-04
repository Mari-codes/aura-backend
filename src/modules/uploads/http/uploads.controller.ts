import { Request, Response } from "express";
import { UploadsService } from "../domain/uploads.service.js";
import { presignSchema } from "./uploads.schemas.js";

export class UploadsController {
  constructor(private service = new UploadsService()) {}

  presign = async (req: Request, res: Response) => {
    const data = presignSchema.parse(req.body);

    const result = await this.service.createPresignedUpload(
      data.productId,
      data.filename,
      data.contentType
    );

    return res.json(result);
  };
}