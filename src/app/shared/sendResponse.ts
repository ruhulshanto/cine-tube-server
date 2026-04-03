import { Response } from "express";

/**
 * Standardized metadata for paginated responses.
 */
type IMeta = {
  page: number;
  limit: number;
  total: number;
};

/**
 * Standardized response interface for CineTube API.
 */
type IResponse<T> = {
  httpStatusCode: number;
  success: boolean;
  message?: string | null;
  meta?: IMeta;
  data?: T | null;
};

/**
 * Standardized utility to send consistent API responses.
 * Uses 'httpStatusCode' to match existing project conventions.
 */
export const sendResponse = <T>(res: Response, data: IResponse<T>): void => {
  const responseData: any = {
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
  };

  res.status(data.httpStatusCode).json(responseData);
};
