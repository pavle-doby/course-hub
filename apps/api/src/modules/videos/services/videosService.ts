import Cloudflare from "cloudflare";
import {
  ConflictError,
  ErrorCode,
  ErrorCodeVideo,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  type CloudflareStreamVideoInfo,
  type CompleteVideoUploadReq,
  type GetVideoByParentReq,
  type GetVideoByParentRes,
  type InitializeVideoUploadReq,
  type InitializeVideoUploadRes,
} from "@repo/contract";
import type { UserEntity } from "@repo/db-schema";
import { env } from "api/env";
import { documentsRepository } from "api/modules/documents/repository/documentsRepository";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { entitlementsService } from "api/modules/plans/services/entitlementsService";
import { plansRepository } from "api/modules/plans/repository/plansRepository";
import { videosRepository } from "../repository/videosRepository";

const cloudflare = new Cloudflare({ apiToken: env.CLOUDFLARE_STREAM_API_TOKEN });

function toProgress(pctComplete: string | undefined): number | null {
  if (pctComplete === undefined || !/^\d+(\.\d+)?$/.test(pctComplete)) {
    return null;
  }
  return Math.min(100, Math.max(0, Number(pctComplete)));
}

function parentFromVideo(video: {
  courseId: string | null;
  topicId: string | null;
  lessonId: string | null;
}): GetVideoByParentReq {
  if (video.courseId) {
    return { parentType: "course", parentId: video.courseId };
  }
  if (video.topicId) {
    return { parentType: "topic", parentId: video.topicId };
  }
  return { parentType: "lesson", parentId: video.lessonId! };
}

// Only the course's creator may change its videos
async function assertCreator(parent: GetVideoByParentReq, authUserId: string): Promise<UserEntity> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  if (!user) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }

  const owner = await documentsRepository.getParentCreator(parent);
  if (!owner) {
    throw new NotFoundError({ code: ErrorCodeVideo.NOT_FOUND });
  }
  if (owner.creatorId !== user.id) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }

  return user;
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

  initializeUpload: async (
    dto: InitializeVideoUploadReq,
    authUserId: string
  ): Promise<InitializeVideoUploadRes> => {
    const user = await assertCreator(dto, authUserId);
    // A video's length is only known once Cloudflare processes it, so this asks for at least a
    // minute of room. ponytail: one long upload can overshoot the limit; the next one is blocked.
    const usedMinutes = (await plansRepository.sumVideoSeconds(user.id)) / 60;
    entitlementsService.assertWithinLimit(user, "videoMinutes", usedMinutes, 1);

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

  completeUpload: async (dto: CompleteVideoUploadReq, authUserId: string): Promise<void> => {
    const video = await videosRepository.getById(dto.id);
    if (!video) {
      throw new NotFoundError({ code: ErrorCodeVideo.NOT_FOUND });
    }
    await assertCreator(parentFromVideo(video), authUserId);
    await videosRepository.markProcessing(dto.id);
  },

  deleteVideo: async (id: string, authUserId: string): Promise<void> => {
    const video = await videosRepository.getById(id);
    if (!video) {
      throw new NotFoundError({ code: ErrorCodeVideo.NOT_FOUND });
    }
    await assertCreator(parentFromVideo(video), authUserId);

    await cloudflare.stream.delete(video.streamUid, { account_id: env.CLOUDFLARE_ACCOUNT_ID });
    await videosRepository.deleteById(id);
  },

  handleWebhook: async (info: CloudflareStreamVideoInfo & { uid: string }) => {
    return await videosRepository.updateFromWebhook(info.uid, info);
  },
};
