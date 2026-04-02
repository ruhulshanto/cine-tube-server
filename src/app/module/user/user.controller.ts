import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUserById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.updateUser(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  const authUser = req.user as { userId: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file?.path) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "Profile image file is required",
    });
  }

  const updated = await UserService.updateProfileImage(authUser.userId, file.path);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile image updated successfully",
    data: updated,
  });
});

const getMyProfileStats = catchAsync(async (req: Request, res: Response) => {
  const authUser = req.user as { userId: string };
  const stats = await UserService.getMyProfileStats(authUser.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile stats fetched successfully",
    data: stats,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  getMyProfileStats,
  updateProfileImage,
  deleteUser,
};
