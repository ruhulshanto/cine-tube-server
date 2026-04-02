import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IRequestUser } from "../../interface/requestUser.interface";
import { SubscriptionService } from "./subscription.service";

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await SubscriptionService.createSubscription(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await SubscriptionService.getMySubscription(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subscription fetched successfully",
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await SubscriptionService.cancelSubscription(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subscription cancelled",
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllSubscriptions(
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subscriptions fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const SubscriptionController = {
  createSubscription,
  getMySubscription,
  cancelSubscription,
  getAllSubscriptions,
};
