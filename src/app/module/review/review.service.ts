import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { CreateReviewPayload, UpdateReviewPayload } from "./review.validation";
import { ReviewRating } from "@prisma/client";
import { PaymentService } from "../payment/payment.service";
import { IRequestUser } from "../../interface/requestUser.interface";

const createReview = async (userId: string, payload: CreateReviewPayload) => {
  const movie = await prisma.movie.findUnique({
    where: { id: payload.movieId, isDeleted: false },
  });

  if (!movie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: payload.movieId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(status.CONFLICT, "You have already reviewed this movie");
  }

  // ✅ New Review Permission Control Logic
  const access = await PaymentService.checkMovieAccess(userId, payload.movieId);
  if (!access.hasAccess) {
    throw new AppError(status.FORBIDDEN, "You need to watch this movie before reviewing");
  }

  const normalizedTags = (payload.tags ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);

  const review = await prisma.review.create({
    data: {
      rating: payload.rating ?? undefined,
      content: payload.content ?? undefined,
      hasSpoiler: payload.hasSpoiler ?? false,
      tags: normalizedTags,
      userId,
      movieId: payload.movieId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  await updateMovieAverageRating(payload.movieId);

  return review;
};

const getAllReviews = async (
  query: Record<string, string | undefined>,
  user?: IRequestUser
) => {
  const {
    page = "1",
    limit = "10",
    movieId,
    userId: queryUserId,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
    status: queryStatus,
  } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  if (queryStatus && user?.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "Only admins can filter reviews by status");
  }

  const where: any = {};

  if (movieId) {
    where.movieId = movieId;
  }

  if (queryUserId) {
    where.userId = queryUserId;
  }

  if (rating) {
    where.rating = rating;
  }

  if (user?.role !== "ADMIN") {
    // Public catalog: only approved (PUBLISHED). Pending / rejected never appear for others.
    // On a movie page (movieId set): guests see only PUBLISHED; logged-in users also see their own PENDING draft.
    if (movieId) {
      if (user?.userId) {
        where.OR = [
          { status: "PUBLISHED" },
          { userId: user.userId, status: "PENDING" },
        ];
      } else {
        where.status = "PUBLISHED";
      }
    } else {
      where.OR = [
        { status: "PUBLISHED" },
        ...(user?.userId ? [{ userId: user.userId, status: "PENDING" }] : []),
      ];
    }
  } else if (
    queryStatus &&
    ["PENDING", "PUBLISHED", "UNPUBLISHED"].includes(queryStatus)
  ) {
    where.status = queryStatus;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limitNum,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
        },
      },
      comments: {
        where: { isDeleted: false },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              _count: {
                select: { reviews: true, likes: true },
              },
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  return review;
};

const updateReview = async (id: string, userId: string, payload: UpdateReviewPayload) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can only edit your own reviews");
  }

  if (review.status !== "PENDING") {
    throw new AppError(status.FORBIDDEN, "Only pending reviews can be edited");
  }

  const updateData: {
    rating?: ReviewRating;
    content?: string;
    hasSpoiler?: boolean;
    tags?: string[];
  } = {};
  if (payload.rating) updateData.rating = payload.rating as ReviewRating;
  if (payload.content) updateData.content = payload.content;
  if (payload.hasSpoiler !== undefined) updateData.hasSpoiler = payload.hasSpoiler;
  if (payload.tags !== undefined) {
    updateData.tags = payload.tags.map((t) => t.trim()).filter(Boolean).slice(0, 20);
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (payload.rating) {
    await updateMovieAverageRating(review.movieId);
  }

  return updatedReview;
};

const deleteReview = async (id: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId && userRole !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "You can only delete your own reviews");
  }

  if (review.status !== "PENDING" && userRole !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "Your review has already been processed and cannot be deleted");
  }

  await prisma.review.delete({
    where: { id },
  });

  await updateMovieAverageRating(review.movieId);

  return { message: "Review deleted successfully" };
};

const updateMovieAverageRating = async (movieId: string) => {
  // Get all PUBLISHED reviews for this movie
  const reviews = await prisma.review.findMany({
    where: { movieId, status: "PUBLISHED" },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.movie.update({
      where: { id: movieId },
      data: { averageRating: 0 },
    });
    return;
  }

  const ratingMap: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
  };

  const totalRating = reviews.reduce((sum, review) => {
    return sum + (ratingMap[review.rating] || 0);
  }, 0);

  const avgRating = totalRating / reviews.length;

  await prisma.movie.update({
    where: { id: movieId },
    data: { averageRating: avgRating },
  });
};

const changeReviewStatus = async (
  reviewId: string,
  statusPayload: "PUBLISHED" | "UNPUBLISHED" | "APPROVED" | "REJECTED",
  userRole: string,
) => {
  if (userRole !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "Only admins can change review status");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  const prismaStatus: "PUBLISHED" | "UNPUBLISHED" =
    statusPayload === "APPROVED" || statusPayload === "PUBLISHED"
      ? "PUBLISHED"
      : "UNPUBLISHED";

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { status: prismaStatus },
  });

  // Re-calculate the average rating for the movie when a review becomes published or unpublished
  await updateMovieAverageRating(review.movieId);

  return updatedReview;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  changeReviewStatus,
};
