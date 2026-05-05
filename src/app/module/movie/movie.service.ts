import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { CreateMoviePayload, UpdateMoviePayload } from "./movie.validation";
import { calculatePagination } from "../../shared/paginationHelper";
import { buildMovieWhereClause } from "./movie.utils";

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const createMovie = async (payload: CreateMoviePayload) => {
  const slug = generateSlug(payload.title);

  const existingMovie = await prisma.movie.findUnique({
    where: { slug },
  });

  if (existingMovie) {
    throw new AppError(status.CONFLICT, "A movie with this title already exists");
  }

  const movie = await prisma.movie.create({
    data: {
      title: payload.title,
      slug,
      synopsis: payload.synopsis,
      posterUrl: payload.posterUrl ?? null,
      backdropUrl: payload.backdropUrl ?? null,
      trailerUrl: payload.trailerUrl ?? null,
      streamingUrl: payload.streamingUrl ?? null,
      releaseYear: payload.releaseYear,
      duration: payload.duration,
      mediaType: payload.mediaType,
      pricingType: payload.pricingType ?? "FREE",
      rentalPrice: payload.rentalPrice ?? null,
      director: payload.director ?? null,
      cast: payload.cast ?? [],
      genres: payload.genres ?? [],
      tags: payload.tags ?? [],
    },
  });

  return movie;
};

const getAllMovies = async (query: Record<string, string | undefined>) => {
  const {
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const { page, limit, skip } = calculatePagination(query);
  const where = buildMovieWhereClause(query);

  // Handle custom sorting cases
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

const getMovieById = async (id: string) => {
  const movie = await prisma.movie.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          reviews: true,
          likes: true,
          watchlist: true,
        },
      },
    },
  });

  if (!movie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  return movie;
};

const getMovieBySlug = async (slug: string) => {
  const movie = await prisma.movie.findUnique({
    where: {
      slug,
      isDeleted: false,
    },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          reviews: true,
          likes: true,
          watchlist: true,
        },
      },
    },
  });

  if (!movie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  return movie;
};

const updateMovie = async (id: string, payload: UpdateMoviePayload) => {
  const existingMovie = await prisma.movie.findUnique({
    where: { id },
  });

  if (!existingMovie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  const updateData: Record<string, unknown> = { ...payload };

  if (payload.title) {
    const slug = generateSlug(payload.title);
    const slugConflict = await prisma.movie.findUnique({
      where: { slug, NOT: { id } },
    });

    if (slugConflict) {
      throw new AppError(status.CONFLICT, "A movie with this title already exists");
    }

    updateData.slug = slug;
  }

  const movie = await prisma.movie.update({
    where: { id },
    data: updateData,
  });

  return movie;
};

const deleteMovie = async (id: string) => {
  const existingMovie = await prisma.movie.findUnique({
    where: { id },
  });

  if (!existingMovie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  await prisma.movie.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return { message: "Movie deleted successfully" };
};

export const MovieService = {
  createMovie,
  getAllMovies,
  getMovieById,
  getMovieBySlug,
  updateMovie,
  deleteMovie,
};
