import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IRequestUser } from "../../interface/requestUser.interface";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  const comment = await CommentService.createComment(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
});

const getCommentsByReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  const result = await CommentService.getCommentsByReview(
    reviewId as string,
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Comments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IRequestUser;

  const comment = await CommentService.updateComment(id as string, user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Comment updated successfully",
    data: comment,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IRequestUser;

  const result = await CommentService.deleteComment(id as string, user.userId, user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const CommentController = {
  createComment,
  getCommentsByReview,
  updateComment,
  deleteComment,
};
