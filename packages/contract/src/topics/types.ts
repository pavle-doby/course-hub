import { z } from "zod";
import { PaginationReq, PaginationRes, Search } from "../shared";
import {
  PublicTopicSchema,
  TopicGetAllQuerySchema,
  TopicPostQuerySchema,
  TopicPutQuerySchema,
  TopicSchema,
} from "./schemas";

export type Topic = z.infer<typeof TopicSchema>;
export type PublicTopic = z.infer<typeof PublicTopicSchema>;

export type GetAllTopicsReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof TopicGetAllQuerySchema>;
export type GetAllTopicsRes = PaginationRes<Topic>;

// GET /courses/public/:publicId/topics → topic names for a published course (no auth)
export type GetPublicTopicsRes = PublicTopic[];

export type GetTopicRes = Topic | undefined;

export type CreateTopicReq = z.infer<typeof TopicPostQuerySchema>;
export type CreateTopicRes = Topic;

export type UpdateTopicReq = z.infer<typeof TopicPutQuerySchema>;
export type UpdateTopicRes = Topic | undefined;

export type DeleteTopicRes = Topic | undefined;
