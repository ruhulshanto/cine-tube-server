import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SearchService } from "./search.service";

const searchMovies = catchAsync(async (req: Request, res: Response) => {
  const result = await SearchService.searchMovies(
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Search results fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const SearchController = {
  searchMovies,
};
