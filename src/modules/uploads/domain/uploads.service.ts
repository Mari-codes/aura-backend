import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../../shared/lib/s3.js";
import { env } from "../../../shared/config/env.js";
import { AppError } from "../../../shared/errors/AppError.js";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function safeFilename(name: string) {
  return name
    .split("/").pop()!
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export class UploadsService {
  async createPresignedUpload(
    productId: string,
    filename: string,
    contentType: string
  ) {
    if (!ALLOWED_TYPES.has(contentType)) {
      throw new AppError("Invalid file type", 400, "INVALID_FILE_TYPE");
    }

    const clean = safeFilename(filename) || "image";
    const key = `products/${productId}/cover-${Date.now()}-${clean}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = `${env.AWS_S3_PUBLIC_BASE_URL}/${key}`;

    return { key, uploadUrl, publicUrl };
  }
}