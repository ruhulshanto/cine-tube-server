import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { AddToWatchlistPayload } from "./watchlist.validation";

const addToWatchlist = async (userId: string, payload: AddToWatchlistPayload) => {
  const movie = await prisma.movie.findUnique({
    where: { id: payload.movieId, isDeleted: false },
  });

  if (!movie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: payload.movieId,
      },
    },
  });

  if (existing) {
    throw new AppError(status.CONFLICT, "Movie already in watchlist");
  }

  const watchlist = await prisma.watchlist.create({
    data: {
      userId,
      movieId: payload.movieId,
    },
    include: {
      movie: true,
    },
  });

  return watchlist;
};

const getMyWatchlist = async (userId: string, query: Record<string, string | undefined>) => {
  const { page = "1", limit = "10" } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            _count: {
              select: { reviews: true, likes: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.watchlist.count({ where: { userId } }),
  ]);

  return {
    data: items,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const removeFromWatchlist = async (userId: string, movieId: string) => {
  const item = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: { userId, movieId },
    },
  });

  if (!item) {
    throw new AppError(status.NOT_FOUND, "Movie not found in watchlist");
  }

  await prisma.watchlist.delete({
    where: {
      userId_movieId: { userId, movieId },
    },
  });

  return { message: "Movie removed from watchlist" };
};

export const WatchlistService = {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
};
