import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      const parsedResult = zodSchema.safeParse(req.body);

      if (!parsedResult.success) {
        // Pass validation error to error handler
        next(parsedResult.error);
        return;
      }

      // Sanitize and attach validated data to request
      req.body = parsedResult.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
