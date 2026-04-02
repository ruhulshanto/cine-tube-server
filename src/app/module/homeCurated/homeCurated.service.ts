import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { HomeSection } from "@prisma/client";

const getCuratedItems = async (section: HomeSection) => {
  const items = await prisma.homeCuratedItem.findMany({
    where: { section },
    orderBy: { position: "asc" },
    include: { movie: true },
  });

  // Keep only movies in the persisted order.
  return items.map((i) => i.movie);
};

const upsertCuratedItems = async (section: HomeSection, movieIds: string[]) => {
  // Empty list is allowed (clears the section).
  if (!movieIds.length) {
    await prisma.homeCuratedItem.deleteMany({ where: { section } });
    return;
  }

  const movies = await prisma.movie.findMany({
    where: { id: { in: movieIds }, isDeleted: false },
    select: { id: true },
  });

  const foundIds = new Set(movies.map((m) => m.id));
  const missing = movieIds.filter((id) => !foundIds.has(id));
  if (missing.length) {
    throw new AppError(status.NOT_FOUND, `Some movies were not found: ${missing[0]}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.homeCuratedItem.deleteMany({ where: { section } });
    await tx.homeCuratedItem.createMany({
      data: movieIds.map((movieId, position) => ({
        section,
        movieId,
        position,
      })),
    });
  });
};

export const HomeCuratedService = {
  getCuratedItems,
  upsertCuratedItems,
};

