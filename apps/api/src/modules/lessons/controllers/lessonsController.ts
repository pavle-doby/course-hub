import { Request, Response } from "express";
import {
  CreateLessonReq,
  DeleteLessonRes,
  GetAllLessonsRes,
  GetLessonRes,
  UpdateLessonReq,
  GetAllLessonsReq,
} from "@repo/contract";
import { lessonsService } from "../services/lessonsService";
import { PaginationReqExtended } from "api/middleware/pagination";

export const lessonsController = {
  getAllLessons: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto: GetAllLessonsReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query?.query,
      topicId: res.locals.query?.topicId,
      courseId: res.locals.query?.courseId,
    };
    const lessons: GetAllLessonsRes = await lessonsService.getAllLessons(authUserId, dto);
    res.status(200).json(lessons);
  },

  getLesson: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const lesson: GetLessonRes = await lessonsService.getLesson(id);
    res.status(200).json(lesson);
  },

  createLesson: async (_req: Request, res: Response): Promise<void> => {
    const reqDto = res.locals.body as CreateLessonReq;
    const resDto = await lessonsService.createLesson(reqDto);
    res.status(201).json(resDto);
  },

  updateLesson: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const reqDto = res.locals.body as UpdateLessonReq;
    const resDto = await lessonsService.updateLesson(id, reqDto);
    res.status(200).json(resDto);
  },

  deleteLesson: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const resDto: DeleteLessonRes = await lessonsService.deleteLesson(id);
    res.status(200).json(resDto);
  },
};
