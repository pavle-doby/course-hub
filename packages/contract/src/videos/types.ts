import { z } from "zod";
import type { CloudflareStreamVideoInfo } from "@repo/db-schema";
import {
  VideoMetadataSchema,
  VideoEditorSchema,
  VideoPlaybackParamsSchema,
  VideoPlaybackResponseSchema,
  VideoParentParamsSchema,
  VideoSchema,
  VideoUploadBodySchema,
  VideoUploadResponseSchema,
  CompleteVideoUploadParamsSchema,
  CloudflareStreamWebhookSchema,
} from "./schemas";

export type Video = z.infer<typeof VideoSchema>;
export type VideoMetadata = z.infer<typeof VideoMetadataSchema>;
export type VideoEditor = z.infer<typeof VideoEditorSchema>;
export type InitializeVideoUploadReq = z.infer<typeof VideoUploadBodySchema>;
export type InitializeVideoUploadRes = z.infer<typeof VideoUploadResponseSchema>;
export type CompleteVideoUploadReq = z.infer<typeof CompleteVideoUploadParamsSchema>;
export type GetVideoPlaybackReq = z.infer<typeof VideoPlaybackParamsSchema>;
export type GetVideoPlaybackRes = z.infer<typeof VideoPlaybackResponseSchema>;
export type GetVideoByParentReq = z.infer<typeof VideoParentParamsSchema>;
export type GetVideoByParentRes = VideoEditor | null;
export type CloudflareStreamWebhook = z.infer<typeof CloudflareStreamWebhookSchema>;
export type { CloudflareStreamVideoInfo };
