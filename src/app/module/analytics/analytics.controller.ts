import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getDashboardStats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result,
  });
});

const getMovieStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getMovieStats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Movie stats fetched successfully",
    data: result,
  });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getUserStats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User stats fetched successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getDashboardStats,
  getMovieStats,
  getUserStats,
};
