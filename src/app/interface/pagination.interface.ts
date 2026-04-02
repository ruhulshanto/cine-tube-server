export interface IPaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
