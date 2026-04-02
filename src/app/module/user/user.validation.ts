import z from "zod";

export const updateUserZodSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50)
    .optional(),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50)
    .optional(),

  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

export type UpdateUserPayload = z.infer<typeof updateUserZodSchema>;