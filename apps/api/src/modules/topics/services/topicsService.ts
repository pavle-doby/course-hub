import {
  CreateTopicReq,
  CreateTopicRes,
  DeleteTopicRes,
  ErrorCodeTopic,
  GetAllTopicsReq,
  GetAllTopicsRes,
  GetTopicRes,
  UpdateTopicReq,
  UpdateTopicRes,
} from "@repo/contract";
import { NotFoundError } from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { topicsRepository } from "../repository/topicsRepository";
import { documentsService } from "api/modules/documents/services/documentsService";
import { coursesService } from "api/modules/courses/services/coursesService";
import { PaginationReqExtended } from "api/middleware/pagination";

export const topicsService = {
  getAllTopics: async (
    authUserId: string,
    dto: GetAllTopicsReq<PaginationReqExtended>
  ): Promise<GetAllTopicsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeTopic.NOT_FOUND });
    return await topicsRepository.getAllTopics({ ...dto, creatorId: user.id });
  },

  getTopic: async (id: string): Promise<GetTopicRes> => {
    return await topicsRepository.getTopicById(id);
  },

  // Resolves topic → course and checks the caller owns it
  assertOwnedTopic: async (id: string, authUserId: string): Promise<void> => {
    const courseId = await topicsRepository.getCourseIdByTopicId(id);
    if (!courseId) {
      throw new NotFoundError({ code: ErrorCodeTopic.NOT_FOUND });
    }
    await coursesService.assertOwnedCourse(courseId, authUserId);
  },

  createTopic: async (data: CreateTopicReq, authUserId: string): Promise<CreateTopicRes> => {
    await coursesService.assertOwnedCourse(data.courseId, authUserId);
    return await topicsRepository.createTopic(data);
  },

  updateTopic: async (
    id: string,
    data: UpdateTopicReq,
    authUserId: string
  ): Promise<UpdateTopicRes> => {
    await topicsService.assertOwnedTopic(id, authUserId);
    if (data.courseId) {
      await coursesService.assertOwnedCourse(data.courseId, authUserId);
    }
    return await topicsRepository.updateTopic(id, data);
  },

  deleteTopic: async (id: string, authUserId: string): Promise<DeleteTopicRes> => {
    await topicsService.assertOwnedTopic(id, authUserId);
    await documentsService.deleteForTopic(id);
    return await topicsRepository.deleteTopic(id);
  },
};
