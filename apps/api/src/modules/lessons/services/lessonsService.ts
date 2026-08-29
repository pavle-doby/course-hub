import {
  CreateLessonReq,
  CreateLessonRes,
  DeleteLessonRes,
  ErrorCodeLesson,
  GetAllLessonsRes,
  GetLessonRes,
  GetAllLessonsReq,
  UpdateLessonReq,
  UpdateLessonRes,
} from "@repo/contract";
import { NotFoundError } from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { lessonsRepository } from "../repository/lessonsRepository";
import { PaginationReqExtended } from "api/middleware/pagination";

export const lessonsService = {
  getAllLessons: async (
    authUserId: string,
    dto: GetAllLessonsReq<PaginationReqExtended>
  ): Promise<GetAllLessonsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeLesson.NOT_FOUND });
    return await lessonsRepository.getAllLessons({ ...dto, creatorId: user.id });
  },

  getLesson: async (id: string): Promise<GetLessonRes> => {
    return await lessonsRepository.getLessonById(id);
  },

  createLesson: async (data: CreateLessonReq): Promise<CreateLessonRes> => {
    return await lessonsRepository.createLesson(data);
  },

  updateLesson: async (id: string, data: UpdateLessonReq): Promise<UpdateLessonRes> => {
    const existing = await lessonsRepository.getLessonById(id);
    if (!existing) throw new NotFoundError({ code: ErrorCodeLesson.NOT_FOUND });
    return await lessonsRepository.updateLesson(id, data);
  },

  deleteLesson: async (id: string): Promise<DeleteLessonRes> => {
    const existing = await lessonsRepository.getLessonById(id);
    if (!existing) throw new NotFoundError({ code: ErrorCodeLesson.NOT_FOUND });
    return await lessonsRepository.deleteLesson(id);
  },
};
