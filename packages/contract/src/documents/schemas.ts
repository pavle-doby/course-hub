import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { documents } from "@repo/db-schema";
import { CONTENT_ITEM_TYPES } from "../shared";

export const DocumentParentParamsSchema = z.object({
  parentType: z.enum(CONTENT_ITEM_TYPES),
  parentId: z.uuid(),
});

export const DocumentUploadBodySchema = DocumentParentParamsSchema.extend({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[^/\\\u0000-\u001f]+$/),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  size: z
    .int()
    .positive()
    .max(25 * 1024 * 1024),
}).refine((file) => file.mimeType === "application/pdf" || file.size <= 10 * 1024 * 1024, {
  message: "Images must not exceed 10 MB",
  path: ["size"],
});

export const DocumentUploadParamsSchema = z.object({ id: z.uuid() });

export const DocumentReorderBodySchema = z.object({
  documentIds: z.array(z.uuid()).min(1).max(20),
});

export const DocumentSchema = createSelectSchema(documents).omit({
  createdAt: true,
  updatedAt: true,
  uploadedByUserId: true,
  objectKey: true,
});

export const PublicDocumentSchema = DocumentSchema.pick({
  id: true,
  courseId: true,
  topicId: true,
  lessonId: true,
  originalFileName: true,
  contentType: true,
  sizeBytes: true,
  position: true,
}).extend({
  originalFileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  position: z.number().int().nonnegative(),
  publicUrl: z.url(),
});

export const DocumentUploadResponseSchema = z.object({
  id: z.uuid(),
  uploadUrl: z.url(),
  requiredHeaders: z.object({ "Content-Type": z.string() }),
});
