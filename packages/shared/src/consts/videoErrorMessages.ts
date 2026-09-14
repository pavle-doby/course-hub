import { ErrorCodeVideo } from "@repo/contract";

export const videoErrorMessages: Record<ErrorCodeVideo, { title: string; message: string }> = {
  [ErrorCodeVideo.NOT_FOUND]: {
    title: "errors.video.NOT_FOUND.title",
    message: "errors.video.NOT_FOUND.message",
  },
  [ErrorCodeVideo.NOT_READY]: {
    title: "errors.video.NOT_READY.title",
    message: "errors.video.NOT_READY.message",
  },
  [ErrorCodeVideo.UPLOAD_FAILED]: {
    title: "errors.video.UPLOAD_FAILED.title",
    message: "errors.video.UPLOAD_FAILED.message",
  },
};
