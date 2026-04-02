import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IRequestUser } from "../../interface/requestUser.interface";
import { LikeService } from "./like.service";

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await LikeService.toggleLike(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const getLikesCount = catchAsync(async (req: Request, res: Response) => {
  const result = await LikeService.getLikesCount(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Likes count fetched",
    data: result,
  });
});

const checkUserLike = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await LikeService.checkUserLike(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Like status fetched",
    data: result,
  });
});

export const LikeController = {
  toggleLike,
  getLikesCount,
  checkUserLike,
};
