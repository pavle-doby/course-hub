import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "api/env";

const client = new S3Client({
  region: "auto",
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const r2Service = {
  /** Creates a short-lived URL for a browser to upload one object directly to R2. */
  createUploadUrl: async (objectKey: string, contentType: string) => {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET,
        Key: objectKey,
        ContentType: contentType,
      }),
      { expiresIn: 15 * 60 } // 15 minutes
    );
    return uploadUrl;
  },

  publicUrl: (objectKey: string) => {
    return new URL(objectKey, `${env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/, "")}/`).toString();
  },

  /** Reads object metadata after upload so the API can verify it before publishing. */
  headObject: async (objectKey: string) => {
    return await client.send(
      new HeadObjectCommand({ Bucket: env.CLOUDFLARE_R2_BUCKET, Key: objectKey })
    );
  },

  /** Permanently removes an object from the configured R2 bucket. */
  deleteObject: async (objectKey: string) => {
    await client.send(
      new DeleteObjectCommand({ Bucket: env.CLOUDFLARE_R2_BUCKET, Key: objectKey })
    );
  },
};
