import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import { IRequestUser } from "../../interface/requestUser.interface";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  const review = await ReviewService.createReview(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: review,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews(
    req.query as Record<string, string | undefined>,
    req.user as IRequestUser | undefined,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await ReviewService.getReviewById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review fetched successfully",
    data: review,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IRequestUser;

  const review = await ReviewService.updateReview(id as string, user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: review,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IRequestUser;

  const result = await ReviewService.deleteReview(id as string, user.userId, user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const changeReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IRequestUser;
  const { status: statusPayload } = req.body;

  const review = await ReviewService.changeReviewStatus(id as string, statusPayload, user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review status updated successfully",
    data: review,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  changeReviewStatus,
};
