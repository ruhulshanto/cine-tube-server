import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { UpdateUserPayload } from "./user.validation";

const REVIEW_RATING_NUMERIC: Record<
  "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "SIX" | "SEVEN" | "EIGHT" | "NINE" | "TEN",
  number
> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
};

const getAllUsers = async (query: Record<string, string | undefined>) => {
  const { page = "1", limit = "10", searchTerm, role } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {
    isDeleted: false,
  };

  if (searchTerm) {
    where.OR = [
      { firstName: { contains: searchTerm, mode: "insensitive" } },
      { lastName: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        profileImage: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id, isDeleted: false },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      profileImage: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          comments: true,
          watchlist: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

const updateUser = async (id: string, payload: UpdateUserPayload) => {
  const user = await prisma.user.findUnique({
    where: { id, isDeleted: false },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: payload as any,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      profileImage: true,
      status: true,
      createdAt: true,
    },
  });

  return updatedUser;
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return { message: "User deleted successfully" };
};

const updateProfileImage = async (userId: string, profileImage: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId, isDeleted: false } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { profileImage },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      profileImage: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getMyProfileStats = async (userId: string) => {
  const [heartsGiven, watchlistCount, reviews] = await Promise.all([
    prisma.like.count({ where: { userId } }),
    prisma.watchlist.count({ where: { userId } }),
    prisma.review.findMany({
      where: { userId, status: "PUBLISHED" },
      select: { rating: true },
    }),
  ]);

  const ratings = reviews
    .map((r) => REVIEW_RATING_NUMERIC[r.rating as keyof typeof REVIEW_RATING_NUMERIC])
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, n) => sum + n, 0) / ratings.length) * 10) / 10
      : null;

  return {
    heartsGiven,
    watchlistCount,
    avgRating,
  };
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  getMyProfileStats,
  updateProfileImage,
  deleteUser,
};
