import { z } from 'zod';
import { PaginationSchema, SearchSchema } from './schemas';

export type PaginationReq = {
  page?: number;
  limit?: number;
};

export type PaginationRes<ItemType> = {
  data: ItemType[];
  pagination: z.infer<typeof PaginationSchema>;
};

export type Search = z.infer<typeof SearchSchema>;
