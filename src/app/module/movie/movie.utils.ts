import { Prisma } from "@prisma/client";

export const buildMovieWhereClause = (query: Record<string, string | undefined>) => {
  const {
    q,
    searchTerm,
    genre,
    releaseYear,
    minRating,
    streamingPlatform,
  } = query;

  const conditions: Prisma.MovieWhereInput[] = [
    { isDeleted: false },
  ];

  const search = q || searchTerm;

  if (search) {
    const cleanSearch = search.trim().toLowerCase();
    const words = cleanSearch.split(/[\s\-:]+/).filter(Boolean);
    const compressedSearch = cleanSearch.replace(/[\s\-:]+/g, "");

    conditions.push({
      OR: [
        { title: { contains: cleanSearch, mode: "insensitive" as Prisma.QueryMode } },
        { synopsis: { contains: cleanSearch, mode: "insensitive" as Prisma.QueryMode } },
        { title: { contains: compressedSearch, mode: "insensitive" as Prisma.QueryMode } },
        ...words.map((word): Prisma.MovieWhereInput => ({
          OR: [
            { title: { contains: word, mode: "insensitive" as Prisma.QueryMode } },
            { synopsis: { contains: word, mode: "insensitive" as Prisma.QueryMode } },
            { director: { contains: word, mode: "insensitive" as Prisma.QueryMode } },
            { cast: { hasSome: [word] } },
            { genres: { hasSome: [word] } },
          ],
        })),
      ],
    });
  }

  if (genre) {
    conditions.push({
      genres: {
        has: genre,
      },
    });
  }

  if (releaseYear) {
    const year = parseInt(releaseYear, 10);
    if (!isNaN(year)) {
      conditions.push({ releaseYear: year });
    }
  }

  if (minRating) {
    const rating = parseFloat(minRating);
    if (!isNaN(rating)) {
      conditions.push({
        averageRating: {
          gte: rating,
        },
      });
    }
  }

  if (streamingPlatform) {
    conditions.push({
      streamingUrl: {
        contains: streamingPlatform,
        mode: "insensitive",
      },
    });
  }

  return { AND: conditions };
};
