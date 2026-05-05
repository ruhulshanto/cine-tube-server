import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../shared/paginationHelper";
import { buildMovieWhereClause } from "../movie/movie.utils";

const searchMovies = async (query: Record<string, string | undefined>) => {
  const {
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const { page, limit, skip } = calculatePagination(query);
  const where = buildMovieWhereClause(query);

  // Handle custom sorting cases (Same logic as MovieService)
  let orderByClause: any = {};
  if (sortBy === "highest-rated") {
    orderByClause = { averageRating: "desc" };
  } else if (sortBy === "most-reviewed") {
    orderByClause = { reviews: { _count: "desc" } };
  } else if (sortBy === "most-liked") {
    orderByClause = { likes: { _count: "desc" } };
  } else if (sortBy === "latest") {
    orderByClause = { releaseYear: "desc" };
  } else {
    orderByClause = { [sortBy]: sortOrder };
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      include: {
        _count: {
          select: {
            reviews: true,
            likes: true,
          },
        },
      },
      orderBy: orderByClause,
      skip,
      take: limit,
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    data: movies,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const SearchService = {
  searchMovies,
};
