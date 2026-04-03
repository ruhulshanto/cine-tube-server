import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Higher-order function to catch asynchronous errors in Express routes.
 * Passes errors to the global error handler middleware.
 */
export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
