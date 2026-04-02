import z from "zod";

const tagItem = z
  .string()
  .trim()
  .min(1, "Tag cannot be empty")
  .max(40, "Each tag must be at most 40 characters");

export const createReviewZodSchema = z.object({
  rating: z.enum(
    ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"],
    { message: "Rating is required" },
  ),
  content: z.string().max(2000, "Content must be at most 2000 characters"),
  hasSpoiler: z.boolean().optional(),
  tags: z.array(tagItem).max(20, "At most 20 tags").optional(),

  movieId: z
    .string({ message: "Movie ID is required" })
    .min(10, "Invalid Movie ID"),
});

export const updateReviewZodSchema = z.object({
  rating: z
    .enum(["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"])
    .optional(),
  content: z.string().max(2000, "Content must be at most 2000 characters").optional(),
  hasSpoiler: z.boolean().optional(),
  tags: z.array(tagItem).max(20, "At most 20 tags").optional(),
});

export const changeReviewStatusZodSchema = z.object({
  status: z.enum(["PUBLISHED", "UNPUBLISHED", "APPROVED", "REJECTED"], {
    message: "Invalid review status",
  }),
});

export type CreateReviewPayload = z.infer<typeof createReviewZodSchema>;
export type UpdateReviewPayload = z.infer<typeof updateReviewZodSchema>;
export type ChangeReviewStatusPayload = z.infer<typeof changeReviewStatusZodSchema>;

