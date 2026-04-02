import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { ILikeTarget } from "./like.interface";

const toggleLike = async (userId: string, target: ILikeTarget) => {
  const { movieId, reviewId, commentId } = target;

  const targets = [movieId, reviewId, commentId].filter(Boolean);
  if (targets.length !== 1) {
    throw new AppError(
      status.BAD_REQUEST,
      "Provide exactly one of: movieId, reviewId, or commentId",
    );
  }

  // Validate the target entity exists
  if (movieId) {
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) throw new AppError(status.NOT_FOUND, "Movie not found");
  }
  if (reviewId) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError(status.NOT_FOUND, "Review not found");
  }
  if (commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new AppError(status.NOT_FOUND, "Comment not found");
  }

  // Check if already liked
  const whereClause: Record<string, unknown> = { userId };
  if (movieId) whereClause.movieId = movieId;
  if (reviewId) whereClause.reviewId = reviewId;
  if (commentId) whereClause.commentId = commentId;

  const existingLike = await prisma.like.findFirst({ where: whereClause });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    return { liked: false, message: "Like removed" };
  }

  await prisma.like.create({
    data: {
      userId,
      movieId: movieId || null,
      reviewId: reviewId || null,
      commentId: commentId || null,
    },
  });

  return { liked: true, message: "Like added" };
};

const getLikesCount = async (target: ILikeTarget) => {
  const { movieId, reviewId, commentId } = target;

  const where: Record<string, unknown> = {};
  if (movieId) where.movieId = movieId;
  if (reviewId) where.reviewId = reviewId;
  if (commentId) where.commentId = commentId;

  const count = await prisma.like.count({ where });
  return { count };
};

const checkUserLike = async (userId: string, target: ILikeTarget) => {
  const { movieId, reviewId, commentId } = target;

  const where: Record<string, unknown> = { userId };
  if (movieId) where.movieId = movieId;
  if (reviewId) where.reviewId = reviewId;
  if (commentId) where.commentId = commentId;

  const like = await prisma.like.findFirst({ where });
  return { liked: !!like };
};

export const LikeService = {
  toggleLike,
  getLikesCount,
  checkUserLike,
};
