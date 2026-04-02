import z from "zod";

export const addToWatchlistZodSchema = z.object({
  movieId: z
    .string({ message: "Movie ID is required" })
    .min(1, "Movie ID is required"),
});

export type AddToWatchlistPayload = z.infer<typeof addToWatchlistZodSchema>;