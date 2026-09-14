import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { videos } from "@repo/db-schema";
import { CONTENT_ITEM_TYPES } from "../shared";

export const CloudflareStreamWebhookSchema = z
  .object({
    uid: z.string().length(32),
    readyToStream: z.boolean(),
    status: z
      .object({
        state: z.string(),
        pctComplete: z.string().optional(),
        errorReasonCode: z.string().optional(),
        errorReasonText: z.string().optional(),
        errReasonCode: z.string().optional(),
        errReasonText: z.string().optional(),
      })
      .loose(),
    thumbnail: z.url().nullable().optional(),
    duration: z.number().nonnegative().optional(),
  })
  .loose();

export const VideoSchema = createSelectSchema(videos).omit({
  createdAt: true,
  updatedAt: true,
});

export const VideoMetadataSchema = VideoSchema.pick({
  id: true,
  name: true,
  status: true,
  durationSeconds: true,
  thumbnailUrl: true,
});

export const VideoEditorSchema = VideoSchema.extend({
  playbackUrl: z.url(),
  processingProgress: z.number().min(0).max(100).nullable().optional(),
});

export const VideoUploadBodySchema = z.object({
  parentType: z.enum(CONTENT_ITEM_TYPES),
  parentId: z.uuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z
    .string()
    .trim()
    .regex(/^video\//),
  size: z.int().positive(),
  maxDurationSeconds: z.int().positive(),
});

export const VideoPlaybackParamsSchema = z.object({
  publicId: z.string().max(12),
  videoId: z.uuid(),
});

export const VideoParentParamsSchema = z.object({
  parentType: z.enum(CONTENT_ITEM_TYPES),
  parentId: z.uuid(),
});

export const VideoUploadResponseSchema = z.object({
  id: z.uuid(),
  uploadUrl: z.url(),
});

export const VideoPlaybackResponseSchema = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime(),
});
