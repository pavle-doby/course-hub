import { z } from "zod";
import { PaginationSchema, SearchSchema } from "./schemas";

export type PaginationReq = {
  page?: number;
  limit?: number;
};

export type PaginationRes<ItemType> = {
  data: ItemType[];
  pagination: z.infer<typeof PaginationSchema>;
};

export type Search = z.infer<typeof SearchSchema>;

export const ContentItemType = {
  COURSE: "course",
  TOPIC: "topic",
  LESSON: "lesson",
} as const;

export type ContentItemType = (typeof ContentItemType)[keyof typeof ContentItemType];

export const CONTENT_ITEM_TYPES = Object.values(ContentItemType) as [
  ContentItemType,
  ...ContentItemType[],
];
