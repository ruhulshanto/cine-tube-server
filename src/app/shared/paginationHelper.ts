import { PAGINATION_DEFAULTS } from "../constants/pagination.constant";

export const calculatePagination = (query: Record<string, string | undefined>) => {
  const page = Math.max(
    Number(query.page) || PAGINATION_DEFAULTS.PAGE,
    1,
  );
  const limit = Math.min(
    Math.max(Number(query.limit) || PAGINATION_DEFAULTS.LIMIT, 1),
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
