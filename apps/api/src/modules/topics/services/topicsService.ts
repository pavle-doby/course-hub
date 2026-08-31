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

  createTopic: async (data: CreateTopicReq): Promise<CreateTopicRes> => {
    return await topicsRepository.createTopic(data);
  },

  updateTopic: async (id: string, data: UpdateTopicReq): Promise<UpdateTopicRes> => {
    const existing = await topicsRepository.getTopicById(id);
    if (!existing) throw new NotFoundError({ code: ErrorCodeTopic.NOT_FOUND });
    return await topicsRepository.updateTopic(id, data);
  },

  deleteTopic: async (id: string): Promise<DeleteTopicRes> => {
    const existing = await topicsRepository.getTopicById(id);
    if (!existing) throw new NotFoundError({ code: ErrorCodeTopic.NOT_FOUND });
    return await topicsRepository.deleteTopic(id);
  },
};
