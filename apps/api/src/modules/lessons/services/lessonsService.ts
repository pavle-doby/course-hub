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
import { documentsService } from "api/modules/documents/services/documentsService";
import { coursesService } from "api/modules/courses/services/coursesService";
import { topicsService } from "api/modules/topics/services/topicsService";
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

  // Resolves lesson → topic → course and checks the caller owns it
  assertOwnedLesson: async (id: string, authUserId: string): Promise<void> => {
    const courseId = await lessonsRepository.getCourseIdByLessonId(id);
    if (!courseId) {
      throw new NotFoundError({ code: ErrorCodeLesson.NOT_FOUND });
    }
    await coursesService.assertOwnedCourse(courseId, authUserId);
  },

  createLesson: async (data: CreateLessonReq, authUserId: string): Promise<CreateLessonRes> => {
    await topicsService.assertOwnedTopic(data.topicId, authUserId);
    return await lessonsRepository.createLesson(data);
  },

  updateLesson: async (
    id: string,
    data: UpdateLessonReq,
    authUserId: string
  ): Promise<UpdateLessonRes> => {
    await lessonsService.assertOwnedLesson(id, authUserId);
    if (data.topicId) {
      await topicsService.assertOwnedTopic(data.topicId, authUserId);
    }
    return await lessonsRepository.updateLesson(id, data);
  },

  deleteLesson: async (id: string, authUserId: string): Promise<DeleteLessonRes> => {
    await lessonsService.assertOwnedLesson(id, authUserId);
    await documentsService.deleteForLesson(id);
    return await lessonsRepository.deleteLesson(id);
  },
};
