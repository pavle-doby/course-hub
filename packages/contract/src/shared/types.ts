export type PaginationReq = {
  page?: number;
  limit?: number;
};

export type PaginationRes<ItemType> = {
  data: ItemType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
};

export type Search = {
  query: string;
};
