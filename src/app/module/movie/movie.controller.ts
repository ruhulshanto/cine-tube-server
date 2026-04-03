import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MovieService } from "./movie.service";

const createMovie = catchAsync(async (req: Request, res: Response) => {
  // If files were uploaded, attach them to the body
  if (req.files && typeof req.files === "object") {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files.poster?.[0]?.path) req.body.posterUrl = files.poster[0].path;
    if (files.backdrop?.[0]?.path) req.body.backdropUrl = files.backdrop[0].path;
    if (files.trailer?.[0]?.path) req.body.trailerUrl = files.trailer[0].path;
    if (files.streaming?.[0]?.path) req.body.streamingUrl = files.streaming[0].path;
  }

  const movie = await MovieService.createMovie(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Movie created successfully",
    data: movie,
  });
});

const getAllMovies = catchAsync(async (req: Request, res: Response) => {
  const result = await MovieService.getAllMovies(
    req.query as Record<string, string | undefined>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Movies fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMovieById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const movie = await MovieService.getMovieById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Movie fetched successfully",
    data: movie,
  });
});

const getMovieBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const movie = await MovieService.getMovieBySlug(slug as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Movie fetched successfully",
    data: movie,
  });
});

const updateMovie = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // If files were uploaded during update, attach them to the body
  if (req.files && typeof req.files === "object") {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files.poster?.[0]?.path) req.body.posterUrl = files.poster[0].path;
    if (files.backdrop?.[0]?.path) req.body.backdropUrl = files.backdrop[0].path;
    if (files.trailer?.[0]?.path) req.body.trailerUrl = files.trailer[0].path;
    if (files.streaming?.[0]?.path) req.body.streamingUrl = files.streaming[0].path;
  }

  const movie = await MovieService.updateMovie(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Movie updated successfully",
    data: movie,
  });
});

const deleteMovie = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await MovieService.deleteMovie(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const MovieController = {
  createMovie,
  getAllMovies,
  getMovieById,
  getMovieBySlug,
  updateMovie,
  deleteMovie,
};
