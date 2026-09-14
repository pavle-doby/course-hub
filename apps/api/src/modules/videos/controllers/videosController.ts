import type { Request, Response } from "express";
import {
  type CloudflareStreamVideoInfo,
  type CompleteVideoUploadReq,
  type GetVideoByParentReq,
  type GetVideoByParentRes,
  type InitializeVideoUploadReq,
  type InitializeVideoUploadRes,
} from "@repo/contract";
import { videosService } from "../services/videosService";

export const videosController = {
  getByParent: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.params as GetVideoByParentReq;
    const video: GetVideoByParentRes = await videosService.getByParent(dto);
    res.status(200).json(video);
  },

  initializeUpload: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.body as InitializeVideoUploadReq;
    const video: InitializeVideoUploadRes = await videosService.initializeUpload(dto);
    res.status(201).json(video);
  },

  completeUpload: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.params as CompleteVideoUploadReq;
    await videosService.completeUpload(dto);
    res.status(204).send();
  },

  deleteVideo: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    await videosService.deleteVideo(id);
    res.status(204).send();
  },

  handleWebhook: async (_req: Request, res: Response): Promise<void> => {
    const dto = res.locals.body as CloudflareStreamVideoInfo & { uid: string };
    await videosService.handleWebhook(dto);
    res.status(200).json({ status: "ok" });
  },
};
