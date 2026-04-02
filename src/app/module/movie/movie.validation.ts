import z from "zod";

export const createMovieZodSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(1, "Title must be at least 1 character")
    .max(200, "Title must be at most 200 characters"),
  synopsis: z
    .string({ message: "Synopsis is required" })
    .min(10, "Synopsis must be at least 10 characters"),
  posterUrl: z.string().optional(),
  backdropUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
  streamingUrl: z.string().optional(),
  releaseYear: z.coerce
    .number({ message: "Release year is required" })
    .int("Release year must be an integer")
    .min(1900, "Release year must be at least 1900")
    .max(new Date().getFullYear() + 10, "Release year cannot be too far in the future"),
  duration: z.coerce
    .number({ message: "Duration is required" })
    .int("Duration must be an integer")
    .positive("Duration must be positive"),
  mediaType: z.enum(["MOVIE", "SERIES"], { message: "Media type must be MOVIE or SERIES" }),
  pricingType: z.enum(["FREE", "PREMIUM", "RENTAL"], { message: "Pricing type must be FREE, PREMIUM, or RENTAL" }).optional(),
  rentalPrice: z.coerce.number().positive("Rental price must be positive").optional(),
  director: z.string().optional(),
  cast: z.preprocess((val) => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string())).optional(),
  genres: z.preprocess((val) => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string())).optional(),
  tags: z.preprocess((val) => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string())).optional(),
});

export const updateMovieZodSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be at least 1 character")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  synopsis: z
    .string()
    .min(10, "Synopsis must be at least 10 characters")
    .optional(),
  posterUrl: z.string().optional(),
  backdropUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
  streamingUrl: z.string().optional(),
  releaseYear: z.coerce
    .number()
    .int("Release year must be an integer")
    .min(1900, "Release year must be at least 1900")
    .max(new Date().getFullYear() + 10, "Release year cannot be too far in the future")
    .optional(),
  duration: z.coerce
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be positive")
    .optional(),
  mediaType: z.enum(["MOVIE", "SERIES"]).optional(),
  pricingType: z.enum(["FREE", "PREMIUM", "RENTAL"]).optional(),
  rentalPrice: z.coerce.number().positive("Rental price must be positive").optional(),
  director: z.string().optional(),
  cast: z.preprocess((val) => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string())).optional(),
  genres: z.preprocess((val) => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string())).optional(),
  tags: z.preprocess((val) => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string())).optional(),
});

export type CreateMoviePayload = z.infer<typeof createMovieZodSchema>;
export type UpdateMoviePayload = z.infer<typeof updateMovieZodSchema>;
