import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelper/AppError";
import { CreatePaymentPayload } from "./payment.validation";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import {
  sendMoviePaymentConfirmationEmail,
  sendSubscriptionConfirmationEmail,
} from "../../utils/paymentEmail";

const createPayment = async (userId: string, payload: CreatePaymentPayload) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: payload.subscriptionId },
  });

  if (!subscription) {
    throw new AppError(status.NOT_FOUND, "Subscription not found");
  }

  if (subscription.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not your subscription");
  }

  const payment = await prisma.payment.create({
    data: {
      amount: payload.amount,
      currency: payload.currency || "USD",
      paymentMethod: payload.paymentMethod || "stripe",
      userId,
      subscriptionId: payload.subscriptionId,
    },
  });

  return payment;
};

const getMyPayments = async (userId: string, query: Record<string, string | undefined>) => {
  const { page = "1", limit = "10" } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        userId,
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            endDate: true,
            startDate: true,
          },
        },
      } as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.payment.count({
      where: { userId },
    }),
  ]);

  return {
    data: payments,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const createMoviePaymentSession = async (
  userId: string,
  movieId: string,
  paymentType: "PURCHASE" | "RENTAL",
) => {
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  // Handle Free movies
  if (movie.pricingType === "FREE") {
    throw new AppError(status.BAD_REQUEST, "This movie is free to watch");
  }

  // Validate rental pricing
  if (paymentType === "RENTAL" && !movie.rentalPrice) {
    throw new AppError(status.BAD_REQUEST, "This movie is not available for rental");
  }

  const amount = paymentType === "RENTAL" ? movie.rentalPrice! : (movie.rentalPrice || 19.99); // Use movie price if available
  const currency = "USD";

  if (!stripe) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Stripe is not configured");
  }

  const clientUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  console.log(`[Stripe Checkout] Creating session for User: ${userId}, Movie: ${movie.title} (${movieId}), Type: ${paymentType}`);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `${paymentType === "PURCHASE" ? "Buy" : "Rent"} - ${movie.title}`,
            images: movie.posterUrl ? [movie.posterUrl] : [],
            description: movie.synopsis,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/movies/${movie.id}`,
    metadata: {
      userId,
      movieId: movie.id,
      paymentType,
    },
  });

  console.log(`[Stripe Checkout] Session created: ${session.id}, URL: ${session.url}`);
  return { checkoutUrl: session.url };
};

const createSubscriptionSession = async (userId: string, plan: "MONTHLY" | "YEARLY") => {
  if (!stripe) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Stripe is not configured");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, lastName: true },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Define Stripe Price IDs (Usually from env or hardcoded for dev)
  // In a real app, these would be 'price_...' IDs from your Stripe Dashboard
  // For this project, we can create a temporary product/price or use the amounts from envVars
  const amount = plan === "MONTHLY" 
    ? Number(envVars.MONTHLY_SUBSCRIPTION_PRICE) || 9.99 
    : Number(envVars.YEARLY_SUBSCRIPTION_PRICE) || 99.99;

  const clientUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  console.log(`[Stripe Subscription] Creating session for User: ${userId} (${user.email}), Plan: ${plan}`);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan === "MONTHLY" ? "Monthly" : "Yearly"} CineTube Premium Pass`,
            description: `Unlimited access to all premium movies and series for one ${plan === "MONTHLY" ? "month" : "year"}.`,
          },
          unit_amount: Math.round(amount * 100),
          recurring: {
            interval: plan === "MONTHLY" ? "month" : "year",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/plans`,
    metadata: {
      userId,
      plan,
      paymentType: "SUBSCRIPTION",
    },
    customer_email: user.email,
  });

  console.log(`[Stripe Subscription] Session created: ${session.id}, URL: ${session.url}`);
  return { checkoutUrl: session.url };
};

const getAllPayments = async (query: Record<string, string | undefined>) => {
  const { page = "1", limit = "20", status: paymentStatus } = query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};
  if (paymentStatus) where.status = paymentStatus;

  const [
    payments,
    total,
    revenueAgg,
    statusGroups,
  ] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        movie: {
          select: { id: true, title: true },
        },
        subscription: {
          select: { id: true, plan: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts = {
    COMPLETED: 0,
    PENDING: 0,
    FAILED: 0,
    REFUNDED: 0,
  };
  for (const row of statusGroups) {
    const k = row.status as keyof typeof counts;
    if (k in counts) counts[k] = row._count._all;
  }

  return {
    data: payments,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
      summary: {
        revenueCompleted: revenueAgg._sum.amount ?? 0,
        countCompleted: counts.COMPLETED,
        countPending: counts.PENDING,
        countFailed: counts.FAILED,
        countRefunded: counts.REFUNDED,
      },
    },
  };
};

const checkMovieAccess = async (userId: string, movieId: string) => {
  // Step 1: Verify movie exists and get pricing type
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true, pricingType: true, title: true },
  });

  if (!movie) {
    throw new AppError(status.NOT_FOUND, "Movie not found");
  }

  // Step 2: FREE movies → everyone has access
  if (movie.pricingType === "FREE") {
    return { hasAccess: true, reason: "FREE_MOVIE" };
  }

  // Step 3: Check if user has an active paid subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, endDate: true },
  });

  const hasPaidSubscription =
    subscription &&
    subscription.status === "ACTIVE" &&
    subscription.plan !== "FREE" &&
    (subscription.endDate === null || subscription.endDate > new Date());

  if (hasPaidSubscription) {
    return { hasAccess: true, reason: "SUBSCRIPTION" };
  }

  // Step 4: Check if user has directly purchased or actively rented this movie
  const movieAccess = await prisma.payment.findFirst({
    where: {
      userId,
      movieId,
      status: "COMPLETED",
      OR: [
        { type: "PURCHASE" },
        { 
          type: "RENTAL",
          expiresAt: { gt: new Date() } 
        }
      ]
    },
    select: { id: true, type: true },
    orderBy: { createdAt: 'desc' }
  });

  if (movieAccess) {
    return { hasAccess: true, reason: movieAccess.type === "RENTAL" ? "RENTAL" : "PURCHASED" };
  }

  // Step 5: No access
  return { hasAccess: false, reason: "PAYMENT_REQUIRED" };
};

/**
 * Shared logic to provision access in DB after a successful Stripe payment.
 * Used by BOTH the webhook handler and the manual verification fallback.
 */
const provisionAccessFromSession = async (session: any) => {
  const metadata = session.metadata || {};
  const { userId, movieId, plan, paymentType } = metadata;
  const stripeId = String(session.payment_intent || session.id);

  console.log(`[Provisioning] Processing ${paymentType} for User: ${userId}, Movie: ${movieId}, Session: ${session.id}`);

  if (paymentType === "SUBSCRIPTION" && userId && plan) {
    const planEnum = plan as any;
    const endDate = new Date();
    if (plan === "MONTHLY") endDate.setMonth(endDate.getMonth() + 1);
    else if (plan === "YEARLY") endDate.setFullYear(endDate.getFullYear() + 1);

    const paidAmount = session.amount_total != null ? session.amount_total / 100 : 0;
    const startDate = new Date();

    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.upsert({
        where: { userId },
        update: { plan: planEnum, status: "ACTIVE", startDate, endDate, price: paidAmount },
        create: { userId, plan: planEnum, status: "ACTIVE", price: paidAmount, startDate, endDate },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: paidAmount,
          currency: session.currency?.toUpperCase() || "USD",
          status: "COMPLETED",
          paymentMethod: "stripe",
          type: "SUBSCRIPTION",
          description: `Subscription Pass - ${plan}`,
          stripePaymentIntentId: session.id,
        },
      });
      return payment;
    });

  } else if (userId && movieId && paymentType) {
    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: stripeId },
    });

    if (!existingPayment) {
      const movieForDesc = await prisma.movie.findUnique({
        where: { id: movieId },
        select: { title: true },
      });

      const expiresAt = paymentType === "RENTAL" ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null;

      const payment = await prisma.payment.create({
        data: {
          userId,
          movieId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || "USD",
          status: "COMPLETED",
          paymentMethod: "stripe",
          type: paymentType as any,
          description: `${paymentType === "RENTAL" ? "Rent" : "Buy"} Access - ${movieForDesc?.title || "Movie Access"}`,
          stripePaymentIntentId: stripeId,
          expiresAt,
        },
      });
      return payment;
    }
    return existingPayment;
  }
  return null;
};

const handleStripeWebhookEvent = async (body: any, signature: string) => {
  if (!stripe) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Stripe is not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, envVars.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    await provisionAccessFromSession(session);
  }

  return true;
};

/**
 * Verify if a Stripe session has been successfully processed by our webhook.
 * Used by the frontend for instant access confirmation.
 */
const verifySessionStatus = async (sessionId: string) => {
  if (!stripe) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Stripe is not configured");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { stripePaymentIntentId: sessionId },
        ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
      ],
    },
  });

  if (payment && payment.status === "COMPLETED") {
    return { status: "COMPLETED" };
  }

  // Fallback: If Stripe says it's paid but it's not in our DB, provision it NOW.
  // This solves issues where webhooks are blocked/delayed in dev environments.
  if (session.payment_status === "paid" || session.status === "complete") {
    console.log(`[Auto-Provision] Session ${sessionId} is paid. Provisioning access fallback...`);
    await provisionAccessFromSession(session);
    return { status: "COMPLETED" };
  }

  return { status: "PENDING" };
};

export const PaymentService = {
  createPayment,
  createMoviePaymentSession,
  createSubscriptionSession,
  checkMovieAccess,
  handleStripeWebhookEvent,
  verifySessionStatus,
  getMyPayments,
  getAllPayments,
};
