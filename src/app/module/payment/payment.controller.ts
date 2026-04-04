import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IRequestUser } from "../../interface/requestUser.interface";
import { PaymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PaymentService.createPayment(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PaymentService.getMyPayments(
    user.userId,
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments(
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const createMovieCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const { movieId, type } = req.body;
  const result = await PaymentService.createMoviePaymentSession(user.userId, movieId, type);

  console.log(`[API Response] Returning checkoutUrl to Client: ${result.checkoutUrl}`);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result,
  });
});

const createSubscriptionCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const { plan } = req.body;
  const result = await PaymentService.createSubscriptionSession(user.userId, plan);

  console.log(`[API Response] Returning subscription checkoutUrl: ${result.checkoutUrl}`);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subscription session created successfully",
    data: result,
  });
});

const checkMovieAccess = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const movieId = req.params.movieId as string;
  const result = await PaymentService.checkMovieAccess(user.userId, movieId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Access check complete",
    data: result,
  });
});

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("[Webhook] POST request received at /webhook");
  const signature = req.headers["stripe-signature"] as string;
  const body = req.body;
  
  if (!signature) {
    console.error("[Webhook Error] No stripe-signature header found");
    return res.status(400).send("Webhook Error: Missing signature");
  }

  try {
    await PaymentService.handleStripeWebhookEvent(body, signature);
    console.log("[Webhook Success] Event processed successfully");
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`[Webhook Error] ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const verifySessionStatus = catchAsync(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const result = await PaymentService.verifySessionStatus(sessionId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Session status retrieved",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  createMovieCheckoutSession,
  createSubscriptionCheckoutSession,
  checkMovieAccess,
  handleStripeWebhookEvent,
  verifySessionStatus,
  getMyPayments,
  getAllPayments,
};

