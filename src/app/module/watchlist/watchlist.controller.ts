import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import { IRequestUser } from "../../interface/requestUser.interface";
import { WatchlistService } from "./watchlist.service";

const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await WatchlistService.addToWatchlist(user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Movie added to watchlist",
    data: result,
  });
});

const getMyWatchlist = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await WatchlistService.getMyWatchlist(
    user.userId,
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Watchlist fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const { movieId } = req.params;
  const result = await WatchlistService.removeFromWatchlist(user.userId, movieId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const WatchlistController = {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
};
