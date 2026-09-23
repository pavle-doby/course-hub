import {
  GetCourseProgressRes,
  UpdateLessonProgressParams,
  UpdateLessonProgressReq,
  UpdateLessonProgressRes,
} from "@repo/contract";
import { Request, Response } from "express";
import { progressService } from "../services/progressService";

export const progressController = {
  getCourseProgress: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const resDto: GetCourseProgressRes = await progressService.getCourseProgress(
      authUserId,
      publicId
    );
    res.status(200).json(resDto);
  },

  updateLessonProgress: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { lessonId } = res.locals.params as UpdateLessonProgressParams;
    const reqDto = res.locals.body as UpdateLessonProgressReq;
    const resDto: UpdateLessonProgressRes = await progressService.updateLessonProgress(
      authUserId,
      lessonId,
      reqDto
    );
    res.status(200).json(resDto);
  },
};
