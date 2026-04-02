import z from "zod";

export const createCommentZodSchema = z.object({
  content: z
    .string({ message: "Comment content is required" })
    .min(1, "Comment must be at least 1 character")
    .max(1000, "Comment must be at most 1000 characters"),

  reviewId: z
    .string({ message: "Review ID is required" })
    .min(1, "Review ID is required"),

  // Add optional parentId for replies
  parentId: z.string().optional(),
});

export const updateCommentZodSchema = z.object({
  content: z
    .string({ message: "Comment content is required" })
    .min(1, "Comment must be at least 1 character")
    .max(1000, "Comment must be at most 1000 characters"),
});

export type CreateCommentPayload = z.infer<typeof createCommentZodSchema>;
export type UpdateCommentPayload = z.infer<typeof updateCommentZodSchema>;