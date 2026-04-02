import { prisma } from "../../lib/prisma";

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalMovies,
    totalReviews,
    totalSubscriptions,
    activeSubscriptions,
    totalRevenue,
    topRatedMovies,
    mostReviewedMovies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.movie.count({ where: { isDeleted: false } }),
    prisma.review.count(),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.movie.findMany({
      where: { isDeleted: false },
      orderBy: { averageRating: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        averageRating: true,
        posterUrl: true,
      },
    }),
    prisma.movie.findMany({
      where: { isDeleted: false },
      orderBy: { reviews: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        _count: { select: { reviews: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalMovies,
    totalReviews,
    totalSubscriptions,
    activeSubscriptions,
    totalRevenue: totalRevenue._sum.amount || 0,
    topRatedMovies,
    mostReviewedMovies,
  };
};

const getMovieStats = async () => {
  const moviesByGenre = await prisma.movie.groupBy({
    by: ["mediaType"],
    where: { isDeleted: false },
    _count: true,
  });

  return { moviesByGenre };
};

const getUserStats = async () => {
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return { usersByRole, recentUsers };
};

export const AnalyticsService = {
  getDashboardStats,
  getMovieStats,
  getUserStats,
};
