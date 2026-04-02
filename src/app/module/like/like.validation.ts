import z from "zod";

export const createLikeZodSchema = z.object({
  movieId: z.string().optional(),
  reviewId: z.string().optional(),
  commentId: z.string().optional(),
}).refine(
  (data) => data.movieId || data.reviewId || data.commentId,
  {
    message: "At least one of movieId, reviewId, or commentId is required",
  }
);