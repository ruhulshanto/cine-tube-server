import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import status from "http-status";
import AppError from "../errorHelper/AppError";
import { handleZodError } from "../errorHelper/handleZodError";
import { TErrorSource } from "../interface/error.interface";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let errorSources: TErrorSource[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err.code && err.code.startsWith('P')) {
    // Prisma error handling
    statusCode = status.BAD_REQUEST;
    message = "Database error";
    errorSources = [
      {
        path: "database",
        message: err.message || "Database operation failed",
      },
    ];
  } else if (err?.name === "MulterError") {
    statusCode = status.BAD_REQUEST;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum allowed size is 2MB."
        : err.message || "File upload failed";
    errorSources = [{ path: "file", message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
  });
};
