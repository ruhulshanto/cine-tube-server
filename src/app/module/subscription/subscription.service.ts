import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { CreateSubscriptionPayload } from "./subscription.validation";

const PLAN_DURATIONS: Record<string, number> = {
  FREE: 0,
  MONTHLY: 30,
  YEARLY: 365,
};

const createSubscription = async (userId: string, payload: CreateSubscriptionPayload) => {
  const existing = await prisma.subscription.findUnique({
    where: { userId },
  });

  const durationDays = PLAN_DURATIONS[payload.plan] || 30;
  const endDate = durationDays > 0
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  if (existing) {
    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        plan: payload.plan,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
      },
    });
    return updated;
  }

  const subscription = await prisma.subscription.create({
    data: {
      plan: payload.plan,
      status: "ACTIVE",
      price: 0,
      endDate,
      userId,
    },
  });

  return subscription;
};

const getMySubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!subscription) {
    throw new AppError(status.NOT_FOUND, "No subscription found");
  }

  return subscription;
};

const cancelSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new AppError(status.NOT_FOUND, "No subscription found");
  }

  const updated = await prisma.subscription.update({
    where: { userId },
    data: {
      status: SubscriptionStatus.CANCELLED,
    },
  });

  return updated;
};

const getAllSubscriptions = async (query: Record<string, string | undefined>) => {
  const { page = "1", limit = "10", plan, status: subStatus } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};
  if (plan) where.plan = plan;
  if (subStatus) where.status = subStatus;

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    data: subscriptions,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const SubscriptionService = {
  createSubscription,
  getMySubscription,
  cancelSubscription,
  getAllSubscriptions,
};
