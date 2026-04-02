import { prisma } from "../../lib/prisma";

const searchMovies = async (query: Record<string, string | undefined>) => {
  const {
    q,
    genre,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {
    isDeleted: false,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { synopsis: { contains: q, mode: "insensitive" } },
    ];
  }

  if (genre) {
    where.genres = {
      has: genre,
    };
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      include: {
        _count: {
          select: { reviews: true, likes: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    data: movies,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const SearchService = {
  searchMovies,
};
