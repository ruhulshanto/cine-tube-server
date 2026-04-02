export interface IQueryParams {
  page?: string;
  limit?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: string | undefined;
}
