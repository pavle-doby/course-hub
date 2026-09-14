import Cloudflare from "cloudflare";
import {
  ConflictError,
  ErrorCodeVideo,
  InternalServerError,
  NotFoundError,
  type CloudflareStreamVideoInfo,
  type CompleteVideoUploadReq,
  type GetVideoByParentReq,
  type GetVideoByParentRes,
  type InitializeVideoUploadReq,
  type InitializeVideoUploadRes,
} from "@repo/contract";
import { env } from "api/env";
import { videosRepository } from "../repository/videosRepository";

const cloudflare = new Cloudflare({ apiToken: env.CLOUDFLARE_STREAM_API_TOKEN });

function toProgress(pctComplete: string | undefined): number | null {
  if (pctComplete === undefined || !/^\d+(\.\d+)?$/.test(pctComplete)) {
    return null;
  }
  return Math.min(100, Math.max(0, Number(pctComplete)));
}

export const videosService = {
  getByParent: async (dto: GetVideoByParentReq): Promise<GetVideoByParentRes> => {
    const video = await videosRepository.getByParent(dto);
    if (!video) {
      return null;
    }

    let processingProgress = toProgress(video.info?.status?.pctComplete);
    if (video.status === "uploading" || video.status === "processing") {
      try {
        const live = await cloudflare.stream.get(video.streamUid, {
          account_id: env.CLOUDFLARE_ACCOUNT_ID,
        });
        processingProgress = toProgress(live.status?.pctComplete);
      } catch {
        // Best-effort: keep last known progress when Cloudflare is unreachable.
      }
    }

    return {
      ...video,
      playbackUrl: `https://customer-${env.CLOUDFLARE_STREAM_CUSTOMER_CODE}.cloudflarestream.com/${video.streamUid}/manifest/video.m3u8`,
      processingProgress,
    };
  },

  initializeUpload: async (dto: InitializeVideoUploadReq): Promise<InitializeVideoUploadRes> => {
    const existing = await videosRepository.getByParent(dto);
    if (existing) {
      throw new ConflictError({ code: ErrorCodeVideo.UPLOAD_FAILED });
    }

    const upload = await cloudflare.stream.directUpload.create({
      account_id: env.CLOUDFLARE_ACCOUNT_ID,
      maxDurationSeconds: dto.maxDurationSeconds,
      meta: { name: dto.fileName },
    });
    if (!upload.uid || !upload.uploadURL) {
      throw new InternalServerError({ code: ErrorCodeVideo.UPLOAD_FAILED });
    }

    const video = await videosRepository.create({ ...dto, streamUid: upload.uid });
    return { id: video.id, uploadUrl: upload.uploadURL };
  },

  completeUpload: async (dto: CompleteVideoUploadReq): Promise<void> => {
    const video = await videosRepository.markProcessing(dto.id);
    if (!video) {
      throw new NotFoundError({ code: ErrorCodeVideo.NOT_FOUND });
    }
  },

  deleteVideo: async (id: string): Promise<void> => {
    const video = await videosRepository.getById(id);
    if (!video) {
      throw new NotFoundError({ code: ErrorCodeVideo.NOT_FOUND });
    }

    await cloudflare.stream.delete(video.streamUid, { account_id: env.CLOUDFLARE_ACCOUNT_ID });
    await videosRepository.deleteById(id);
  },

  handleWebhook: async (info: CloudflareStreamVideoInfo & { uid: string }) => {
    return await videosRepository.updateFromWebhook(info.uid, info);
  },
};
