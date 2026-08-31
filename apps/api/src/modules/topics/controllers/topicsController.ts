import { Request, Response } from "express";
import {
  CreateTopicReq,
  DeleteTopicRes,
  GetAllTopicsReq,
  GetAllTopicsRes,
  GetTopicRes,
  UpdateTopicReq,
} from "@repo/contract";
import { topicsService } from "../services/topicsService";
import { PaginationReqExtended } from "api/middleware/pagination";

export const topicsController = {
  getAllTopics: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto: GetAllTopicsReq<PaginationReqExtended> = {
      ...res.locals.pagination,
      query: res.locals.query?.query,
      courseId: res.locals.query?.courseId,
    };
    const topics: GetAllTopicsRes = await topicsService.getAllTopics(authUserId, dto);
    res.status(200).json(topics);
  },

  getTopic: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const topic: GetTopicRes = await topicsService.getTopic(id);
    res.status(200).json(topic);
  },

  createTopic: async (_req: Request, res: Response): Promise<void> => {
    const reqDto = res.locals.body as CreateTopicReq;
    const resDto = await topicsService.createTopic(reqDto);
    res.status(201).json(resDto);
  },

  updateTopic: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const reqDto = res.locals.body as UpdateTopicReq;
    const resDto = await topicsService.updateTopic(id, reqDto);
    res.status(200).json(resDto);
  },

  deleteTopic: async (_req: Request, res: Response): Promise<void> => {
    const { id } = res.locals.params as { id: string };
    const resDto: DeleteTopicRes = await topicsService.deleteTopic(id);
    res.status(200).json(resDto);
  },
};
