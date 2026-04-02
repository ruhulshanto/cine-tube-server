import { Request, Response } from "express";
import status from "http-status";
import { AuthService } from "./auth.service";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  const { tokens } = result.data;

  // Set cookies
  tokenUtils.setAccessTokenCookie(res, tokens.accessToken);
  tokenUtils.setRefreshTokenCookie(res, tokens.refreshToken);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  const { tokens } = result.data;

  // Set cookies
  tokenUtils.setAccessTokenCookie(res, tokens.accessToken);
  tokenUtils.setRefreshTokenCookie(res, tokens.refreshToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
  }

  const result = await AuthService.refreshAccessToken(token);

  // Set new access token cookie
  tokenUtils.setAccessTokenCookie(res, result.accessToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: result.accessToken,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  const result = await AuthService.getUser(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  await AuthService.changePassword(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully",
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  getMe,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};
