import { z } from "zod";

export const upsertHomeCuratedZodSchema = z.object({
  movieIds: z
    .array(z.string().min(1))
    .max(20)
    .default([]),
});

export type UpsertHomeCuratedPayload = z.infer<typeof upsertHomeCuratedZodSchema>;

