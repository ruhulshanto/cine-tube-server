import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: `API Route Not Found - ${req.originalUrl}`,
    errorSources: [
      {
        path: req.originalUrl,
        message: 'Route does not exist',
      },
    ],
  })
}

