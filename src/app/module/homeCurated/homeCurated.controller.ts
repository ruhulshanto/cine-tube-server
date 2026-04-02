import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { HomeSection } from "@prisma/client";
import { HomeCuratedService } from "./homeCurated.service";
import { IRequestUser } from "../../interface/requestUser.interface";

const getFeatured = catchAsync(async (_req: Request, res: Response) => {
  const result = await HomeCuratedService.getCuratedItems(HomeSection.FEATURED);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Featured curated items fetched successfully",
    data: result,
  });
});

const getEditorsPicks = catchAsync(async (_req: Request, res: Response) => {
  const result = await HomeCuratedService.getCuratedItems(HomeSection.EDITORS_PICKS);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Editors picks curated items fetched successfully",
    data: result,
  });
});

const upsertFeatured = catchAsync(async (req: Request, res: Response) => {
  // Auth guard already enforced in route; keep typing for clarity.
  const _user = req.user as IRequestUser;

  const { movieIds } = req.body as { movieIds: string[] };
  await HomeCuratedService.upsertCuratedItems(HomeSection.FEATURED, movieIds);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Featured curated items updated successfully",
  });
});

const upsertEditorsPicks = catchAsync(async (req: Request, res: Response) => {
  const _user = req.user as IRequestUser;

  const { movieIds } = req.body as { movieIds: string[] };
  await HomeCuratedService.upsertCuratedItems(HomeSection.EDITORS_PICKS, movieIds);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Editors picks curated items updated successfully",
  });
});

export const HomeCuratedController = {
  getFeatured,
  getEditorsPicks,
  upsertFeatured,
  upsertEditorsPicks,
};

