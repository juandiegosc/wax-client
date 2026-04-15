export type InfinityPaginationParams<TCursor> = {
  cursor?: TCursor;
  pageSize?: number;
};

export type InfinityPagedList<TItem, TCursor> = {
  items: TItem[];
  nextCursor: TCursor;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
};

export type PagedList<T> = Pagination & {
  items: T[];
};